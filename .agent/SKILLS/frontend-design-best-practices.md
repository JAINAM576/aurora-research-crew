# Frontend Design Best Practices — Applied to the Aurora Crew UI

A practical checklist for actually building the glassmorphism/aurora frontend, distilled down to what matters for *this* project rather than generic advice.

---

## 1. Ground every choice in the subject

This isn't a generic dashboard — it's a **visualization of four AI agents handing work to each other**. Every design decision should make that handoff visible and legible, not just look pretty. Before styling anything, ask: *does this element help the person understand what the crew is doing right now?* If not, cut it.

## 2. The hero is a thesis, not a hero image

Don't open with a generic "AI Research Assistant" headline + gradient blob. Open with the thing that's actually distinctive here: **the live agent pipeline itself**, front and center, even before a report exists. The empty/idle state of the pipeline (four quiet glass nodes, waiting) *is* the hero — it previews exactly what's about to happen the moment someone submits a topic.

## 3. Typography carries personality — use it with restraint

- **Fraunces** (display) only for the H1 and section headers. Never body text, never button labels — if it shows up more than a few times per screen it stops feeling special.
- **Manrope/Inter** (body) for everything functional: form labels, agent status text, report body.
- **IBM Plex Mono** (utility) exclusively for machine-y details — model names, timestamps, token counts. This is what makes the "which provider is this agent using" detail feel intentional rather than like debug output.

Don't reach for a third display face or extra weights "for variety" — two type roles, used consistently, read as more designed than four used loosely.

## 4. Structure should encode real information

The four agent nodes are numbered/ordered because the crew genuinely runs sequentially — that's a real process, so a 1→2→3→4 structure is earned here, not decorative. But don't add numbered markers, eyebrows, or dividers anywhere else just for texture — e.g. don't number the report's sections if they're not really sequential steps, just topical sections.

## 5. One signature moment — the Aurora Relay

Spend your "boldness budget" entirely on the relay animation (agent nodes lighting up gold + the connecting thread animating as work passes between them). Everything else — background aurora drift, card hover states, transitions — should be quiet and disciplined by comparison. If you're tempted to add a second flashy animation (confetti on completion, bouncing icons, etc.), that's very likely the sign to cut it — the relay should be the one thing people remember.

## 6. Motion — deliberate, not scattered

- Aurora background: slow ambient drift (30–45s loop), always running, never distracting.
- Agent node activation: a single deliberate pulse (~600ms) — not a spinner, not a bounce.
- Report reveal: sections fade/slide in as they stream from the backend — this reinforces "this is being generated live," which is true and worth showing.
- Everything else: **no animation**. Buttons don't need a wiggle; cards don't need parallax on scroll.

## 7. Respect the quality floor (non-negotiable, not stylistic)

- Responsive down to mobile — agent pipeline stacks vertically, aurora blur radius reduced (perf).
- Visible keyboard focus rings on every interactive element (form input, submit button, any report links).
- `prefers-reduced-motion: reduce` freezes the aurora drift and relay pulse to a static state — test this, don't just assume it works.
- Text-on-glass contrast checked against WCAG AA — glassmorphism is the single easiest place for a design to look great and fail accessibility silently.

## 8. Writing in the interface — from the user's side of the screen

- Name things by what the person controls, not how the system is built. The input is "What do you want researched?" not "Enter crew topic parameter."
- Action labels stay consistent end to end: if the button says "Generate Report," the loading state says "Generating…" and the completion state doesn't suddenly call it something else.
- Agent status copy should describe *what's happening*, not just *that something's happening*: "Cross-checking 6 claims against sources" beats "Fact-Checker running."
- Errors (rate limit hit, provider timeout) explain what happened and what to do — "Groq's free tier hit its per-minute limit — retrying in 12s" is far more useful than "Something went wrong."
- Empty state (before first submission) should invite action, not just sit blank: a short prompt or example topic beats a bare input field.

## 9. Self-critique pass before calling it done

Before shipping the UI, look at it and ask:
- Does it look like *this* project, or would it look the same for any AI-agent demo? (If it's interchangeable, the aurora/beige-gold identity isn't coming through strongly enough.)
- Is there more than one "loud" element competing for attention? (There should only be one — the relay.)
- Could I remove one thing and make it better? (Chanel's rule: take one accessory off before you leave the house.)

---

This is meant to sit alongside the implementation plan — use it as a checklist while building `AuroraBackground`, `GlassCard`, and `AgentPipeline` so the execution stays true to the design intent rather than drifting into generic dashboard territory.
