# genshin-mods

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Claude Code plugin of five mods drawn as one band above the prompt, in the session character's colour: the next steps one press away, what the session is spending with a one-press handoff, recording mode, a goal's task list and clock, and a question before editing a file another session just changed.

- **Waypoints** — after each answered turn, up to three next steps the session suggests, each a button that sends it as the next prompt.
- **Resin** — the prompt cache's time left, the context window, the five-hour and weekly limits and the cost so far, with **Warm**, **Compact** and **Handoff**, and a toast before the cache goes cold.
- **Veil** — recording mode: emails, amounts, phone numbers and secrets shown as placeholders while the model still reads the real values.
- **Commission** — a goal meter over the session's task list: the goal, tasks done, the share complete and the minutes since it started.
- **Ward** — before an edit to a file another session changed in the last half hour, a question: proceed, move to a worktree, or cancel.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

This repository is a Claude Code plugin marketplace named `esposter`:

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install genshin-mods@esposter
```

A clone of this repository needs neither command: `.agents/settings.json` enables the plugin at project scope once you trust the repository. With [`genshin-persona`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-persona) installed beside it, the band takes the session character's colour; without it, the game's interface gold.

Developing the plugin from a checkout loads the directory itself, with the installed copy disabled so only one of them answers:

```bash
claude plugin disable genshin-mods@esposter
claude --plugin-dir packages/genshin-mods
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/infra/claude-interface/genshin-mods) to level up.

### Command reference

Each mod is switched by its own slash command; bare, it flips, and the choice is kept across sessions:

| Command                   | What it does                                                        |
| :------------------------ | :------------------------------------------------------------------ |
| `/waypoints [on \| off]`  | Suggests the next steps after each answered turn, or stops          |
| `/resin [on \| off]`      | Shows the cache, context, limits and cost row and its warning toast |
| `/veil [on \| off]`       | Turns recording mode on or off; off by default                      |
| `/commission [on \| off]` | Shows the goal meter while a turn works through a task list         |
| `/ward [on \| off]`       | Asks before an edit to a file another session just changed          |

With the band focused (a click or `ctrl+x tab`), `w`, `c` and `h` warm, compact and hand off, `1` to `3` send a waypoint and `g` opens or closes the whole task list.

### Commands

Run from `packages/genshin-mods/`:

```bash
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm validate     # claude plugin validate: the engine's own reading of the hooks module
pnpm lint:fix     # auto-fix lint
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-mods/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-mods/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-mods/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-mods.svg
