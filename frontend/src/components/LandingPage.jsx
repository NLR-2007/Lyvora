import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Send, MessageCircle, Shield, Repeat,
  KeyRound, Filter, CalendarClock, Gauge, ChevronDown, Camera, Check,
} from "lucide-react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import HeroShowcase from "./HeroShowcase";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "../lib/constants";

/* Section shell. The reference bounds its content in a fixed column and draws a
   hairline down both edges of it, which is what gives the page its ruled,
   documentary rhythm. Every section reuses it so those rules stay continuous. */
const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`relative border-b border-border ${className}`}>
    {/* Double hairline: an outer rule on the column edge and a second inset by
        8px. The pair is what reads as a ruled margin rather than a plain box. */}
    <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 lg:block">
      <div className="absolute inset-y-0 inset-x-0 border-x border-border" />
      <div className="absolute inset-y-0 inset-x-2 border-x border-border" />
    </div>
    <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-16">{children}</div>
  </section>
);

const Eyebrow = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
    <Sparkles className="h-3.5 w-3.5" />
    {children}
  </span>
);

const NAV = [
  { label: "Product", href: "#features" },
  { label: "Channels", href: "#channels" },
  { label: "Access", href: "#access" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  { icon: MessageCircle, title: "Comment-to-DM triggers",
    body: "Watch Reels and posts for a keyword, then send that commenter a personalised DM automatically." },
  { icon: KeyRound, title: "Passwordless connection",
    body: "Accounts connect by exported session cookie. No Instagram password is ever stored or transmitted." },
  { icon: Repeat, title: "Spintax templates",
    body: "{Hello|Hi|Hey} {username} — every message varies naturally so no two sends read identically." },
  { icon: Send, title: "Telegram broadcasting",
    body: "Queue posts across multiple channels with timezone-aware scheduling and RRULE recurrence." },
  { icon: Filter, title: "Channel auto-moderation",
    body: "Per-channel rules combining spam, keyword, link and custom filters with auto-delete." },
  { icon: Shield, title: "Opt-out compliance",
    body: "Anyone replying STOP or UNSUBSCRIBE is blocklisted automatically, before the next send." },
];

/* Real operating defaults from the engine — not growth metrics. */
const SPECS = [
  { value: "30", label: "Default daily DM cap per account" },
  { value: "45–120s", label: "Randomised delay between sends" },
  { value: "3-tier", label: "Cascading DM delivery fallback" },
  { value: "08:00–22:00", label: "Default working-hours window" },
];

const CHANNELS = [
  { icon: Camera, name: "Instagram", lines: ["Comment-triggered DMs", "Multi-account sessions", "Per-account proxy support", "Send/fail deduplication"] },
  { icon: Send, name: "Telegram", lines: ["Multi-bot management", "Channel auto-sync", "Scheduled + recurring posts", "Auto-moderation rules"] },
];

const FAQ = [
  { q: "Do I need Meta API approval?",
    a: "No. Lyvora drives a real browser session, so you can start without waiting on Meta's review queue or app approval." },
  { q: "Do you store my Instagram password?",
    a: "No. Accounts are connected by exporting your browser session cookies as JSON. No password is stored or transmitted at any point." },
  { q: "How do you avoid getting accounts flagged?",
    a: "Sends are rate limited to a configurable daily cap, spaced by randomised 45–120 second delays, restricted to working hours, and varied with spintax." },
  { q: "How do I get an account?",
    a: `New signups are reviewed before activation. Register, then contact ${SUPPORT_EMAIL} and an administrator will approve access.` },
];

export default function LandingPage({ onGetStarted, onNavigateLegal }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-background font-body text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-16">
          <button onClick={onGetStarted} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span aria-hidden>✦</span> Lyvora
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a key={item.label} href={item.href}
                 className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href={SUPPORT_MAILTO}
               className="hidden rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted sm:inline-flex">
              Contact
            </a>
            <Button onClick={onGetStarted} className="rounded-full px-5 text-sm font-medium">Sign In</Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <Section className="overflow-hidden">
        <div className="flex flex-col items-center py-20 text-center md:py-28">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Eyebrow>Instagram DM + Telegram automation</Eyebrow>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-8 max-w-4xl font-display text-5xl font-normal leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
          >
            Turn every comment into a conversation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Connect your accounts, set a keyword, and let Lyvora send the DM, schedule the
            broadcast, and moderate the channel — on a schedule you control.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button onClick={onGetStarted} className="h-11 rounded-full px-6 text-sm font-medium">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
            <a href={SUPPORT_MAILTO}
               className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted">
              Request access
            </a>
          </motion.div>

          {/* Capability strip, mirroring the reference's segmented row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-muted/50 p-1"
          >
            {[
              { icon: MessageCircle, label: "Comment triggers" },
              { icon: CalendarClock, label: "Scheduled posts" },
              { icon: Filter, label: "Moderation" },
              { icon: Gauge, label: "Rate limiting" },
            ].map(({ icon: Icon, label }) => (
              <span key={label}
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {label}
              </span>
            ))}
          </motion.div>

          <HeroShowcase />

        </div>
      </Section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <Section id="features">
        <div className="py-20 md:py-24">
          <div className="max-w-2xl">
            <Eyebrow>Capabilities</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-normal leading-tight tracking-tight md:text-5xl">
              Everything you need to run outreach unattended
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-card p-7">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-5 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Operating defaults ──────────────────────────────────────────── */}
      <Section>
        <div className="py-16 md:py-20">
          <h2 className="font-display text-3xl font-normal tracking-tight md:text-4xl">Built to stay under the limits</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Pacing is enforced by the engine, not left to the operator. These are the defaults every account ships with.
          </p>
          <dl className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SPECS.map(({ value, label }) => (
              <div key={label} className="border-t border-border pt-5">
                <dt className="font-display text-3xl tracking-tight md:text-4xl">{value}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ── Channels ────────────────────────────────────────────────────── */}
      <Section id="channels">
        <div className="py-20 md:py-24">
          <div className="max-w-2xl">
            <Eyebrow>Two channels, one workspace</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-normal leading-tight tracking-tight md:text-5xl">
              Instagram and Telegram, side by side
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {CHANNELS.map(({ icon: Icon, name, lines }) => (
              <div key={name} className="rounded-xl border border-border bg-card p-8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="mt-5 font-display text-2xl tracking-tight">{name}</h3>
                <ul className="mt-5 space-y-3">
                  {lines.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Access ──────────────────────────────────────────────────────── */}
      <Section id="access">
        <div className="py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Access</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-normal leading-tight tracking-tight md:text-5xl">
              Free during Beta
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Lyvora is in private beta. Accounts are reviewed and approved by an administrator
              before activation, so there is no self-serve signup yet.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={onGetStarted} className="h-11 rounded-full px-6 text-sm font-medium">
                Sign in
              </Button>
              <a href={SUPPORT_MAILTO}
                 className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted">
                Request access
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <Section id="faq">
        <div className="grid gap-12 py-20 md:grid-cols-[minmax(0,22rem)_1fr] md:py-24">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-normal leading-tight tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <div className="divide-y divide-border border-t border-border">
            {FAQ.map(({ q, a }, i) => {
              const open = openFaq === i;
              return (
                <div key={q}>
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-base font-medium">{q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <p className="pb-6 text-sm leading-relaxed text-muted-foreground">{a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <Section>
        <div className="py-24 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-6xl">
            Stop answering the same comment twice
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Connect an account, set one keyword, and let the engine handle the rest.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={onGetStarted} className="h-11 rounded-full px-6 text-sm font-medium">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
            <a href={SUPPORT_MAILTO}
               className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted">
              Request access
            </a>
          </div>
        </div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span aria-hidden>✦</span> Lyvora
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Leading Your Vision with Optimized Reliable Automation.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Product</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Capabilities</a></li>
                <li><a href="#channels" className="text-muted-foreground transition-colors hover:text-foreground">Channels</a></li>
                <li><a href="#access" className="text-muted-foreground transition-colors hover:text-foreground">Access</a></li>
                <li><a href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Legal</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><button type="button" onClick={() => onNavigateLegal("privacy")} className="text-muted-foreground transition-colors hover:text-foreground">Privacy</button></li>
                <li><button type="button" onClick={() => onNavigateLegal("terms")} className="text-muted-foreground transition-colors hover:text-foreground">Terms</button></li>
                <li><button type="button" onClick={() => onNavigateLegal("disclaimer")} className="text-muted-foreground transition-colors hover:text-foreground">Disclaimer</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Contact</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href={SUPPORT_MAILTO} className="text-muted-foreground transition-colors hover:text-foreground">{SUPPORT_EMAIL}</a></li>
                <li><button type="button" onClick={onGetStarted} className="text-muted-foreground transition-colors hover:text-foreground">Sign in</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Lyvora. All rights reserved.
            </p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Developed by <span className="font-semibold">NLR Group of Companies</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
