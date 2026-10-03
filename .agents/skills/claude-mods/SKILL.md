---
name: claude-mods
description: Apply when writing or reviewing a Claude Code mod — a plugin's hooks module (`hooks/hooks.json` naming `modules`), its state contract, or anything under packages/genshin-mods or packages/genshin-persona/mod. Esposter's conventions for function hooks — the rules the engine enforces at load (relative imports, one unmatched hook per event, `$` and atoms kept in the file that uses them, an inline state contract), the file shape they force, the lint seams with the engine's slots, and the authoring loop.
---

# Claude Code mods

Every rule below is explained, with the refusal it prevents and the shape it forces, on `apps/web/content/docs/architecture/claude-mods.md`; the authoring loop is its diagram. The engine's API is its declaration file, which the built-in "plugin-authoring" skill names: grep it for the event or noun at hand rather than recalling it.

## Settled — do not re-propose

- **`#src/*` imports in a hooks module.** The engine refuses every specifier but a relative path to the plugin's own file and `claude-code`, so the relative-import exception covers the mod trees and nothing else (`oxlint.config.ts`).
- **JSX, or a `.tsx` file, in a mod.** The element constructors are plain functions taking `children` as a prop, `.tsx` means a Tiled tileset here, and a JSX compiler setting would be the package's one tsconfig difference.
- **Committing the engine's declarations, or a hand-written copy of them.** They are the engine's, per version and early access; nothing publishes them, so they are laid locally and gitignored.
- **`claude plugin test` suites for logic.** Its runner has no fs, network or process and is not the repository's Vitest; logic lives in pure modules Vitest covers, and the wiring is what `claude plugin validate` checks.
- **Writing a person's `settings.json` from a plugin.** A status line, a spinner word, a hint and a hook on any settings event are all reachable from a hooks module, and a write there outlives the plugin.
- **A mod object (`{ onSessionStart, … }`) per mod, composed by the register file.** Its handlers take `$` across an import, which the engine refuses; one lifecycle file holds every unmatched event instead.

## Rules

- **Relative imports only, to the plugin's own files, plus `claude-code`**; a dependency-free file of another of the plugin's trees (the persona's verb enum) is reachable the same way.
- **Each unmatched event has exactly one hook in the plugin**, in one `registerLifecycle` file shared by every mod; a mod's own file holds only matched hooks.
- **A function that receives `on` returns nothing** — every `register<Name>(on)` is `void`.
- **A function taking `$` is declared in its calling hook's file**; code that never touches `$` lives in a pure module beside its test, and a button's action is a closure over `$`.
- **Each file makes the atoms it uses, plugin and key as literals, every initial taken from `InitialState`**; switches share one record, because a loop has no way to name a key.
- **The contract's keys are written inline in `interface PluginState { "<plugin>": { … } }`** in `types/index.d.ts`, the value types exported beside them.
- **A registration's `.catch` handler is a module-level `const` in that file, and no other binding there shares its name** — not even a parameter.
- **No Node in a mod**: game data, audio, sockets and anything an npm package does run in the plugin's node scripts through `$.process.run`, the hook's input on stdin.
- **Everything a drawing reads is `$.state`**; a module variable is lost on reload and holds only what nothing draws. A value kept past the session is written to `$.store` and read back at session start.
- **One `AbovePrompt` hook per plugin**, drawing one row per mod with something to say.
- **`session.start` fires once per process**: a `/clear` or a resume is a `session.end` with that reason and a new session id, so state belonging to the conversation is reset there.
- **`$.ui.status` is a pinned notice drawn with a warning mark, not the status line**: a standing word goes among the footer's mode labels (`SessionMode`, added to `modes` so other plugins' stay), anything larger in the band, and the status line stays the person's own settings command.
- **A mod that asks the model asks through `$.model.fork`**, served from the session's own prompt cache.
- **A question nobody can answer proceeds**: `$.session.surfaces()` empty means a headless run, and a guard never blocks unattended work.
- **The engine's slots meet the lint in fixed places** — a timer or a press floats its action through one local wrapper, a registration's `.catch`, `$.clock.every`, `JSON.parse` and an interpolated string constant each have one answer on the docs page, and a literal's order never carries meaning since perfectionist sorts it.
- **The accent is the session character's**, read from `genshin-persona`'s published state through its contract, with the game's interface gold where the persona is absent; labels use the game's word only where it already means the thing.
- **The loop is validate, typecheck with the declarations laid, lint, Vitest, then `claude --plugin-dir` with the installed copy disabled**; a refusal whose message is cut short is read by validating, in the scratchpad, a minimal mod doing just the questioned thing.
- **A new rule the engine enforces is a row in the docs page's table in the change that answers it**, and a line here.
