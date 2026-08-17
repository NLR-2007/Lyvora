import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { apiLogin, apiRegister } from "../api";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "../lib/constants";

/**
 * Sign in / create account.
 *
 * Background is a drifting particle field over a grid of accent rules that draw
 * themselves in on mount — the same ruled language as the landing page.
 *
 * Deliberately absent: social sign-in and "forgot password". The backend
 * exposes exactly two auth routes, /api/auth/register and /api/auth/login, so
 * buttons for Google, GitHub or a reset link would be controls that cannot work.
 */
export default function AuthPage({ onAuthSuccess, onBackToHome }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    // Ambient motion is decoration; honour a reduced-motion preference by not
    // starting the loop at all rather than merely slowing it.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return undefined;

    let raf = 0;
    let particles = [];

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      setSize();
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      particles = Array.from({ length: count }, make);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Sparks are tinted from the theme so they read on a light canvas too.
      const tint = getComputedStyle(document.documentElement)
        .getPropertyValue("--particle-rgb").trim() || "250,250,250";
      particles.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) Object.assign(p, make(), { y: canvas.height + Math.random() * 40 });
        ctx.fillStyle = `rgba(${tint},${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", init);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", init);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
    setForm({ username: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        const data = await apiLogin(form.username, form.password);
        onAuthSuccess(data);
      } else {
        if (!form.email.includes("@")) {
          setError("Please enter a valid email address.");
          return;
        }
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        await apiRegister(form.username, form.email, form.password);
        setSuccess(
          "Account created. An administrator needs to approve it before you can sign in — " +
          `we'll review it shortly. Questions? Email ${SUPPORT_EMAIL}`
        );
        setMode("login");
        setForm({ username: form.username, email: "", password: "" });
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <section className="fixed inset-0 overflow-y-auto bg-background text-foreground">
      <style>{`
        :root { --particle-rgb: 10,10,10; }
        .dark { --particle-rgb: 250,250,250; }

        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:var(--border-color);will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}

        .card-animate{opacity:0;transform:translateY(20px);animation:fadeUp .8s cubic-bezier(.22,.61,.36,1) .4s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}

        @media (prefers-reduced-motion: reduce){
          .hline,.vline,.card-animate{animation:none;opacity:1;transform:none}
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_30%,rgba(128,128,128,0.10),transparent_60%)]" />

      <div className="accent-lines" aria-hidden>
        <div className="hline" /><div className="hline" /><div className="hline" />
        <div className="vline" /><div className="vline" /><div className="vline" />
      </div>

      <canvas ref={canvasRef} aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-border px-6 py-4">
        <button onClick={onBackToHome}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Lyvora
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href={SUPPORT_MAILTO}
             className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted">
            Contact <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Card */}
      <div className="relative z-10 grid min-h-full w-full place-items-center px-4 py-24">
        <Card className="card-animate w-full max-w-sm border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-3xl font-normal tracking-tight">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to your Lyvora workspace and pick up where the automation left off."
                : "Register for access. An administrator approves new accounts before activation."}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/50 p-1">
              {[["login", "Sign in"], ["register", "Create account"]].map(([m, label]) => (
                <button key={m} type="button" onClick={() => switchMode(m)}
                        aria-current={mode === m}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}>
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-border bg-[color:var(--danger-glow)] px-3 py-2 text-sm text-[color:var(--danger)]">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="rounded-lg border border-border bg-[color:var(--success-glow)] px-3 py-2 text-sm text-[color:var(--success)]">
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                {/* Sign-in is by username: /api/auth/login takes a username, not an email. */}
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="username" name="username" autoComplete="username" required
                         value={form.username} onChange={handleChange}
                         placeholder="yourname" className="pl-10" />
                </div>
              </div>

              {!isLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" name="email" type="email" autoComplete="email" required
                           value={form.email} onChange={handleChange}
                           placeholder="you@company.com" className="pl-10" />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" name="password" required
                         type={showPass ? "text" : "password"}
                         autoComplete={isLogin ? "current-password" : "new-password"}
                         value={form.password} onChange={handleChange}
                         placeholder="••••••••" className="pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                          aria-label={showPass ? "Hide password" : "Show password"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {!isLogin && <p className="text-xs text-muted-foreground">At least 6 characters.</p>}
              </div>

              <Button type="submit" disabled={loading} className="h-10 w-full rounded-lg">
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Please wait</>
                  : <>{isLogin ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <div>
              {isLogin ? "New to Lyvora?" : "Already have an account?"}
              <button type="button" onClick={() => switchMode(isLogin ? "register" : "login")}
                      className="ml-1 font-medium text-foreground hover:underline">
                {isLogin ? "Request access" : "Sign in"}
              </button>
            </div>
            <a href={SUPPORT_MAILTO} className="text-[10px] tracking-wide text-muted-foreground/70 transition-colors hover:text-muted-foreground">
              {SUPPORT_EMAIL}
            </a>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
