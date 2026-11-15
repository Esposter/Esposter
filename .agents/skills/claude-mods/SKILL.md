---
name: claude-mods
description: Apply when writing or reviewing a Claude Code mod — a plugin's hooks module (`hooks/hooks.json` naming `modules`), its state contract, or anything under packages/genshin-mods or packages/genshin-persona/mod. Esposter's conventions for function hooks the engine checks at load.
---

# Claude Code mods

Every rule below is explained, with the refusal it prevents and the shape it forces, on `openspec/specs/architecture/claude-mods/design.md`; the authoring loop is its diagram. The engine's API is its declaration file, which Claude Code's built-in plugin-authoring skill names: grep it for the event or noun at hand rather than recalling it.

## Settled — do not re-propose

- **`#src/*` imports in a hooks module.** The engine refuses every specifier but a relative path to the plugin's own file and `claude-code`, so the relative-import exception covers the mod trees and nothing else (`oxlint.config.ts`).
- **JSX, or a `.tsx` file, in a mod.** The element constructors are plain functions taking `children` as a prop, `.tsx` means a Tiled tileset here, and a JSX compiler setting would be the package's one tsconfig difference.
- **Committing the engine's declarations, or a hand-written copy of them.** They are the engine's, per version and early access; nothing publishes them, so they are laid locally and gitignored.
- **`claude plugin test` suites for logic.** Its runner has no fs, network or process and is not the repository's Vitest; logic lives in pure modules Vitest covers, and the wiring is what `claude plugin validate` checks.
- **Writing a person's `settings.json` from a plugin.** A status line, a spinner word, a hint and a hook on any settings event are all reachable from a hooks module, and a write there outlives the plugin.
- **One `registerLifecycle(on, …)` entry in `register.ts`, alongside matched mod registrations.** Matcherless lifecycle handlers live together because the engine permits one hook per event per plugin.

## Rules

The rules themselves, each with the refusal it prevents and the shape it forces, are the table in `openspec/specs/architecture/claude-mods/design.md`; a rule the engine enforces that has no row there is not yet recorded. What is left here is the procedure:

- **The loop is validate, typecheck with the declarations laid, lint, Vitest, then `claude --plugin-dir` with the installed copy disabled**; a refusal cut short is read off a scratchpad mod that does nothing but the questioned thing, validated alone.
- **A new rule the engine enforces is a row in the design's table in the change that answers it.**
- **A hook surface's cap or escape handling is read off the installed Claude Code build before a mod relies on it.** The build's JavaScript greps in place (`grep -a -o` over a small context window, run in the background), and the version read is cited where the number is used.
