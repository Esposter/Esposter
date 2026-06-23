# Keyword Notification Rules

Per-user, per-room custom keyword rules (beyond `@mentions`) checked on `createMessage` and delivered via Event Grid + Web Push.

## Why not

- Mention-based notifications already cover the core "ping me when relevant" need.
- Custom rules add per-user DB state and per-message scanning cost for marginal gain.
