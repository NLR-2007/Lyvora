import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageCircle, Send, Calendar, Building2, Sparkles, LayoutGrid,
  FileText, GitBranch, ListChecks, MoreHorizontal, AtSign,
} from "lucide-react";

/**
 * Hero product mockup: a deck of comment-trigger cards that cycles. The front
 * card drops to the back of the deck and the next one rises forward.
 *
 * Illustrative sample data — demo handles, not real users. Every field maps to
 * something the engine actually does (keyword match, spintax variant, daily
 * cap, working-hours window), so the mockup does not imply capabilities the
 * product lacks.
 */

const TRIGGERS = [
  {
    handle: "@ravi.designs", name: "Ravi Desai", initials: "RD", tone: "var(--danger)",
    source: "commented on Reel", when: "just now", post: "Free Notion kit",
    comment: "“SEND me the guide”", keyword: "Exact keyword · SEND",
    message: "Hey Ravi — thanks for commenting! Here’s the free Notion kit you asked for. Reply STOP any time to opt out.",
    variant: "Spintax variant 2 of 6", account: "@lyvora.demo", cap: "12 of 30 sent today",
    time: "Today, 10:40", status: "Queued", filled: 2,
  },
  {
    handle: "@marcus.builds", name: "Marcus Bell", initials: "MB", tone: "var(--info)",
    source: "commented on Reel", when: "2m ago", post: "Launch checklist",
    comment: "“send checklist please”", keyword: "Contains · SEND",
    message: "Hi Marcus — appreciate the comment! The launch checklist is on its way. Reply STOP to opt out.",
    variant: "Spintax variant 5 of 6", account: "@lyvora.demo", cap: "13 of 30 sent today",
    time: "Today, 10:42", status: "Sending", filled: 3,
  },
  {
    handle: "@aisha.studio", name: "Aisha Rahman", initials: "AR", tone: "var(--success)",
    source: "commented on Reel", when: "6m ago", post: "Brand kit teardown",
    comment: "“SEND the teardown”", keyword: "Exact keyword · SEND",
    message: "Hey Aisha — thanks for watching! Here’s the full brand kit teardown. Reply STOP any time to opt out.",
    variant: "Spintax variant 1 of 6", account: "@lyvora.demo", cap: "14 of 30 sent today",
    time: "Today, 10:46", status: "Delivered", filled: 3,
  },
  {
    handle: "@devon.park", name: "Devon Park", initials: "DP", tone: "var(--warning)",
    source: "commented on Post", when: "11m ago", post: "Pricing breakdown",
    comment: "“can you send this?”", keyword: "Contains · SEND",
    message: "Hi Devon — thanks for reaching out! Sending the pricing breakdown now. Reply STOP to opt out.",
    variant: "Spintax variant 4 of 6", account: "@lyvora.demo", cap: "15 of 30 sent today",
    time: "Today, 10:51", status: "Queued", filled: 1,
  },
];

const Tile = ({ icon: Icon, label, children }) => (
  <div className="rounded-lg border border-border bg-background/60 p-3.5">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
    <div className="mt-2 text-[12px] leading-snug">{children}</div>
  </div>
);

/* Content of the front card. Keyed on handle so AnimatePresence crossfades it
   as the deck turns, while the card shell itself stays put. */
const CardBody = ({ t }) => (
  <div className="grid md:grid-cols-[minmax(0,15rem)_1fr]">
    <div className="border-b border-border p-5 md:border-b-0 md:border-r">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold">
        {t.initials}
      </div>
      <h3 className="mt-3.5 text-[15px] font-semibold">{t.name}</h3>
      <p className="text-[12px] text-muted-foreground">Commented on “{t.post}”</p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[12px] font-medium">
          <Send className="h-3.5 w-3.5" /> Draft DM
        </span>
        {[FileText, GitBranch, ListChecks, MoreHorizontal].map((Icon, i) => (
          <span key={i} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        ))}
      </div>

      <dl className="mt-5 space-y-3 border-t border-border pt-4">
        {[
          { icon: AtSign, label: "Handle", value: t.handle },
          { icon: MessageCircle, label: "Comment", value: t.comment },
          { icon: GitBranch, label: "Matched", value: t.keyword },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-[11px] text-muted-foreground">{label}</dt>
              <dd className="truncate text-[12px] font-medium">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>

    <div className="p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <LayoutGrid className="h-4 w-4" /> Trigger detail
      </div>

      <div className="mt-3.5 grid gap-3 lg:grid-cols-[1fr_minmax(0,13rem)]">
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Generated message</span>
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2.5 text-[13px] font-medium leading-relaxed">“{t.message}”</p>
          <p className="mt-2.5 text-[11px] text-muted-foreground">{t.variant} · personalised with @handle</p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Channel</span>
            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2.5 text-[13px] font-medium">Instagram DM</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Session connected</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Tile icon={Calendar} label="Scheduled">
          <span className="font-medium">{t.time}</span>
          <p className="mt-1 text-[11px] text-muted-foreground">Within 08:00–22:00</p>
        </Tile>
        <Tile icon={Building2} label="Account">
          <span className="font-medium">{t.account}</span>
          <p className="mt-1 text-[11px] text-muted-foreground">{t.cap}</p>
        </Tile>
        <Tile icon={Send} label="Delivery">
          <span className="font-medium">{t.status}</span>
          <div className="mt-2 flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 flex-1 rounded-full"
                initial={{ backgroundColor: "var(--border-color)" }}
                animate={{ backgroundColor: i < t.filled ? "var(--success)" : "var(--border-color)" }}
                transition={{ duration: 0.35, delay: 0.12 * i }}
              />
            ))}
          </div>
        </Tile>
      </div>
    </div>
  </div>
);

const ROTATE_MS = 4200;
const STEP_Y = 34;      // how far each card behind peeks above the one in front
const STEP_SCALE = 0.03;

export default function HeroShowcase() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = TRIGGERS.length;

  useEffect(() => {
    // Holding still is the correct behaviour for reduced-motion and on hover:
    // an auto-rotating deck is decoration, and it steals focus while reading.
    if (reduceMotion || paused) return undefined;
    const id = setInterval(() => setActive((i) => (i + 1) % n), ROTATE_MS);
    return () => clearInterval(id);
  }, [reduceMotion, paused, n]);

  const front = TRIGGERS[active];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="relative mx-auto w-full max-w-4xl select-none text-left"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* All cards share one grid cell, so the container is as tall as the front
          card and the ones behind it peek out via transform only. */}
      <div className="grid" style={{ paddingTop: (n - 1) * STEP_Y }}>
        {TRIGGERS.map((t, i) => {
          const depth = (i - active + n) % n;   // 0 = front
          const isFront = depth === 0;
          return (
            <motion.div
              key={t.handle}
              className="col-start-1 row-start-1 overflow-hidden rounded-xl border border-border bg-card"
              style={{ zIndex: n - depth, transformOrigin: "top center" }}
              animate={{
                y: -depth * STEP_Y,
                scale: 1 - depth * STEP_SCALE,
                boxShadow: isFront ? "var(--shadow-dashboard)" : "none",
              }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
              aria-hidden={!isFront}
            >
              <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
                <span className="h-2 w-2 shrink-0 rotate-45" style={{ background: t.tone }} />
                <span className="text-[13px] font-semibold">{t.handle}</span>
                <span className="truncate text-[12px] text-muted-foreground">
                  · {t.source} · {t.when}
                </span>
              </div>

              {/* Only the front card carries the detail panel; the cards behind
                  contribute their header strip and nothing else. */}
              <div className={isFront ? "" : "pointer-events-none invisible"}>
                <AnimatePresence mode="wait" initial={false}>
                  {isFront && (
                    <motion.div
                      key={front.handle}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.28 }}
                    >
                      <CardBody t={front} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deck controls */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {TRIGGERS.map((t, i) => (
          <button
            key={t.handle}
            onClick={() => setActive(i)}
            aria-label={`Show trigger from ${t.handle}`}
            aria-current={i === active}
            className="group h-6 w-6 rounded-full"
          >
            <span
              className={`mx-auto block h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-foreground" : "w-1.5 bg-border group-hover:bg-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
