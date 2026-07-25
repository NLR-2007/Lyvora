"""Endpoint-level auth and rate limiting."""
import pytest
from fastapi.testclient import TestClient

from backend.database import LoginAttempt, SessionLocal


@pytest.fixture(scope="module")
def client():
    import backend.main as main

    return TestClient(main.app)


@pytest.fixture
def user(client):
    """A registered account, reused across the auth tests."""
    import uuid

    username = f"probe_{uuid.uuid4().hex[:8]}"
    payload = {"username": username, "email": f"{username}@example.com", "password": "correct-horse"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200, response.text
    return payload


def _clear_attempts(username):
    db = SessionLocal()
    db.query(LoginAttempt).filter(LoginAttempt.username_key == username.lower()).delete()
    db.commit()
    db.close()


def test_login_succeeds_with_correct_password(client, user):
    _clear_attempts(user["username"])
    response = client.post("/api/auth/login", json={"username": user["username"], "password": user["password"]})
    assert response.status_code == 200
    assert response.json()["access_token"]


def test_repeated_failures_lock_the_account_out(client, user):
    _clear_attempts(user["username"])
    codes = [
        client.post("/api/auth/login", json={"username": user["username"], "password": "wrong-password"}).status_code
        for _ in range(10)
    ]
    assert codes[:8] == [400] * 8, "should allow 8 attempts before locking"
    assert codes[8:] == [429, 429], "should reject once the limit is hit"
    _clear_attempts(user["username"])


def test_failed_attempts_are_persisted_not_held_in_memory(client, user):
    """An in-memory counter resets on restart and does not hold across workers."""
    _clear_attempts(user["username"])
    client.post("/api/auth/login", json={"username": user["username"], "password": "wrong-password"})

    db = SessionLocal()
    count = db.query(LoginAttempt).filter(LoginAttempt.username_key == user["username"].lower()).count()
    db.close()
    assert count == 1
    _clear_attempts(user["username"])


def test_a_successful_login_clears_the_counter(client, user):
    _clear_attempts(user["username"])
    for _ in range(3):
        client.post("/api/auth/login", json={"username": user["username"], "password": "wrong-password"})

    assert client.post(
        "/api/auth/login", json={"username": user["username"], "password": user["password"]}
    ).status_code == 200

    db = SessionLocal()
    count = db.query(LoginAttempt).filter(LoginAttempt.username_key == user["username"].lower()).count()
    db.close()
    assert count == 0


@pytest.mark.parametrize("path", [
    "/api/settings",
    "/api/accounts",
    "/api/tg/bots",
    "/api/media",
    "/api/tg/uploads/anything.png",
])
def test_endpoints_reject_anonymous_callers(client, path):
    assert client.get(path).status_code == 401


@pytest.mark.parametrize("probe", [
    "..%5C..%5Cconfig.py",   # encoded backslash — reaches the route on Windows
    "..\\..\\config.py",
    "../../config.py",       # normalised away by the client, never routed
    "..%2F..%2Fconfig.py",
])
def test_upload_traversal_never_serves_a_file(client, probe):
    """This endpoint had no auth at all and would serve backend/config.py.

    Rejection can be either 401 (auth runs first) or 404 (the path never
    matched the route); what matters is that no file content comes back.
    """
    response = client.get(f"/api/tg/uploads/{probe}")
    assert response.status_code in (401, 404)
    assert "API_SECRET_KEY" not in response.text
    assert "NVIDIA_API_KEY" not in response.text


def test_admin_endpoints_reject_a_normal_user(client, user):
    token = client.post(
        "/api/auth/login", json={"username": user["username"], "password": user["password"]}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    assert client.get("/api/admin/users", headers=headers).status_code == 403
    assert client.get("/api/admin/stats", headers=headers).status_code == 403


def test_a_forged_token_is_rejected(client):
    headers = {"Authorization": "Bearer not.a.real.token"}
    assert client.get("/api/settings", headers=headers).status_code == 401
