# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](../../deferred/infra/) instead. Rationale lives in [Cost & Security Posture](../../specs/infra/cost-and-security-posture/design.md) and `apps/infra/docs/`.

## Open

- [ ] [Dependency admission](../../specs/architecture/dependency-admission/design.md) — the heavy engines by the client bytes `pnpm ai:dependencies:score --sort bundle` reads from the app's real build: the survey creator, three, apexcharts and mathjs each weighed for a lighter engine, a later load or neither; the PDF wrappers give way to the renderer's own viewer components ([component wrapper absorption](../architecture-component-wrapper-absorption-program/design.md)), and GrapesJS is answered by the [page builder](../resource-page-builder-program/design.md)
- [ ] [Agent console](../infra-agent-console-program/design.md) — past terminal parity and the shipped connecting (host installer, session windows, device pairing, remote connections) and the Code tab's shell pane: diff comments, side chat, effort level and session titles, so a day's work needs no terminal; Anthropic-hosted sessions on the reader's own API key; then the Genshin theme, the views and the terminal-mirror driver

## Blocked (the character voice still switched on after two weeks of daily use)

- [ ] [The viewer as the stage](../infra-viewer-stage/design.md) — each spoken line a bubble and a sound on the model in the desktop viewer already running, through its local socket, and the terminal's attention hooks moving the model; no window built
- [ ] [Chat into the session](../infra-channel-chat/design.md) — a local chat page as a channel pushing typed lines into the terminal's own session, and a permission answered by tapping the model; behind the research-preview flag on every launch

## Blocked (a Transformers.js release that loads Chatterbox Multilingual)

- [ ] [Multilingual spoken replies](../infra-multilingual-spoken-replies/design.md) — the text's script picks the model's language token, the dub keeps picking the voice, and the output streams by clause to pay for the slower engine
