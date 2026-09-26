# Discord Parity

Read when a messaging behaviour, name, default, setting or feature semantic is undecided.

Esbabbler is a Discord clone. When a behaviour, structure, naming, information architecture, default, or feature semantic is undecided, **default to whatever Discord does** instead of inventing our own — bespoke decisions should be near zero.

- **Match:** feature behaviour, settings layout/categories, naming (Discord's term wins — e.g. "Roles", "Voice & Video"), defaults (e.g. push-to-talk off), scope (user vs server/room setting), keybinds, and copy.
- **Diverge only on:** visual styling (the UI library's — not ours to match pixel-for-pixel) and the explicit infra/storage constraints already recorded (Postgres + Azure Table split, no expensive infrastructure).
- **When Discord's behaviour is unknown or ambiguous:** record it as an open question in the spec/roadmap — do not silently invent. A guess that diverges from Discord is a defect, not a design choice.
- A feature Discord has but we deliberately dropped lives in `apps/web/content/docs/esbabbler/rejected/` or `deferred/` with rationale — grep there before re-proposing.
