---
name: claude-mods
description: Apply when writing or reviewing a Claude Code mod — a plugin's hooks module (`hooks/hooks.json` naming `modules`), its state contract, or anything under packages/genshin-mods or packages/genshin-persona/mod. Esposter's conventions for function hooks — the engine's own constraints (relative imports, no Node, declarations it alone writes), pure logic split out for Vitest, one band per plugin composed from rows, drawn state in $.state, and theming read from the persona's contract.
---

# Claude Code mods

What each mod in the repository does, and why, is its docs page (`apps/web/content/docs/proposals/infra/claude-mods/index.md` until each ships). The engine's own API is its declaration file, which the engine writes beside a mod it has loaded (`.claude-plugin/types/claude-code/index.d.ts`) and which the built-in `plugin-authoring` skill points to: grep it for the event or noun at hand rather than recalling it.

## Settled — do not re-propose

- **`#src/*` imports in a hooks module.** `claude plugin validate` refuses every specifier but a relative path to the plugin's own file and `claude-code`; the engine is the forcing agent, so the relative-import exception covers the mod trees and nothing else (`oxlint.config.ts`).
- **Committing the engine's declarations, or a hand-written copy of them.** They are the engine's, written per version and declared early access; a copy is stale on the next update, and nothing publishes them as a package.
- **`claude plugin test` suites for logic.** Its runner has no fs, network or process and its tests are not the repository's Vitest; logic a test earns lives in a plain module Vitest covers, and the hooks around it are checked by `claude plugin validate`.
- **Writing a person's `settings.json` from a plugin.** A status line, a spinner word, a hint and a hook on any settings event are all reachable from a hooks module, and a write there outlives the plugin.

## Rules

- **A hooks module imports only its own files by relative path, plus types from `claude-code`** — and may import a dependency-free file of its plugin's other trees the same way (the persona's verb enum), never one that imports through `#src/*`.
- **A mod has no Node.** Game data, audio, sockets and anything an npm package does run in the plugin's own node scripts, reached through `$.process.run` with the hook's input on stdin.
- **Logic a test earns is a pure function in its own file, beside its `*.test.ts`**, and the hook file is wiring: events in, state out, no branch worth testing.
- **Everything a drawing reads is `$.state`**, declared in the plugin's one contract file (`types/index.d.ts`, named in `plugin.json`); a module variable is lost on every reload. A value kept past the session is written to `$.store` too and read back at `session.start`.
- **One `AbovePrompt` hook per plugin**, drawing one row per mod with something to say; a second hook from the same plugin would compete for the one band.
- **A mod that asks the model asks through `$.model.fork`**, which the API serves from the session's own prompt cache; `$.model.complete` re-sends a context of its own.
- **A hook that can fail registers a `.catch`** that passes to `next(e)`, so a broken mod never blocks the engine's own behaviour; a question the person cannot answer (`$.ui.ask` in a headless run) proceeds.
- **The accent is the session character's**, read from `genshin-persona`'s published state through its contract (`dependencies` in `plugin.json`), with the game's interface gold where the persona is absent.
- **Labels speak the game's vocabulary only where the word already means the thing** (resin for spendable capacity, a waypoint for where to go next); a command and a button say what they do.
- **Run `claude plugin validate <plugin>` after every change to a hooks module and whenever the engine updates**; its report of what the module hooks and calls is the check that the engine sees what was meant.
- **Development loads the working tree with `claude --plugin-dir <plugin>` with the installed copy disabled** — two loads fire every hook twice.
