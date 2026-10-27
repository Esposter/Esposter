# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](../../deferred/infra/) instead. Rationale lives in [Cost & Security Posture](../../specs/infra/cost-and-security-posture/design.md) and `apps/infra/docs/`.

## Open

- [ ] Confirm the deploy's pre-deploy step runs `pnpm --filter @esposter/db-schema db:migrate` — the startup migrate plugin was removed in commit 7b2df93dac on the claim that production's pre-deploy migrate runs before each start, but the Railway dashboard that configures that step is not in this repository, and nothing in the tracked tree (workflows, `apps/infra`, Dockerfiles) runs it. Until the owner confirms it from that dashboard, the five sites that state it (`AGENTS.md`, `CONTRIBUTING.md`, `apps/web/README.md`, `packages/db-schema/README.md`, `.agents/skills/drizzle/SKILL.md`) are unverified; if the step is absent, the step is added to the deploy before the app can start against pending migrations
- [ ] [Dependency admission](../../specs/architecture/dependency-admission/design.md) — the heavy engines by the client bytes `pnpm ai:dependencies:score --sort bundle` reads from the app's real build; the rewrites that hold behaviour of their own become headless published packages — the [PDF viewer package](../archive/2026-10-18-architecture-pdf-viewer-package/design.md) here, and the dashboard grid's on the resource roadmap — and GrapesJS is answered by the [page builder](../resource-page-builder-program/design.md)
- [ ] A runnable command that names the data root — the clip, parity and text commands in the `genshin-menu-quit-prompt`, `genshin-menu-time` and `genshin-character-kits` tasks and designs write `{data-root}/…` as a placeholder the shell does not expand, and `scripts/src/services/recreation/commands/clipCommand.ts` takes its `--directory` verbatim, so a verbatim run writes into a literal `{data-root}` folder. Decide the one form a command carries, an environment variable the tools read or a substitution the tools make, against the placeholder rule in [repo-owned-facts](../../../.agents/skills/openspec/references/repo-owned-facts.md) ("Machine roots"), and apply it to every such page in the same change
- [ ] [Agent console](../infra-agent-console-program/design.md) — past terminal parity and the shipped connecting (host installer, session windows, device pairing, remote connections) and the Code tab's shell pane: diff comments, side chat, effort level and session titles, so a day's work needs no terminal; Anthropic-hosted sessions on the reader's own API key; then the Genshin theme, the views and the terminal-mirror driver

## Blocked (the character voice still switched on after two weeks of daily use)

- [ ] [The viewer as the stage](../infra-viewer-stage/design.md) — each spoken line a bubble and a sound on the model in the desktop viewer already running, through its local socket, and the terminal's attention hooks moving the model; no window built
- [ ] [Chat into the session](../infra-channel-chat/design.md) — a local chat page as a channel pushing typed lines into the terminal's own session, and a permission answered by tapping the model; behind the research-preview flag on every launch

## Blocked (a Transformers.js release that loads Chatterbox Multilingual)

- [ ] [Multilingual spoken replies](../infra-multilingual-spoken-replies/design.md) — the text's script picks the model's language token, the dub keeps picking the voice, and the output streams by clause to pay for the slower engine
