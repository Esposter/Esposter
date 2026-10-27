# genshin-mods

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Claude Code plugin of mods: five drawn as one band above the prompt, in the session character's colour (the next steps one press away, what the session is spending with a one-press handoff, recording mode, a goal's task list and clock, and a question before editing a file another session just changed), a delegation guard that refuses any subagent not on haiku and nudges a run of lookups toward a haiku agent, a disk-scan guard that refuses a Bash scan from a root or a home folder, and a whole-index guard that refuses a git command over the whole index while another session shares the checkout.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
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

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/infra/claude-interface/genshin-mods) to level up.

- **Commission** — a goal meter over the session's task list: the goal, tasks done, the share complete and the minutes since it started.
- **Delegation guard** — every subagent launch not on haiku refused, a fork included, and after every third lookup in a row with no decision between them, a note on that call's result that the chain goes to a haiku agent as one bounded question.
- **Disk-scan guard** — a Bash `find`, `du`, `grep -r` or `ls -R` that starts at `/`, a drive, `~` or a home folder is refused, with the known place to look for the file.
- **Pulse** — keeps the machine watcher running from any session with the plugin, so its heartbeat and the machine's state keep being written.
- **Resin** — the prompt cache's time left, the context window, the five-hour and weekly limits and the cost so far, with **Warm**, **Compact** and **Handoff**, a toast before the cache goes cold, and a usage reserve past four-fifths of a limit window, or past half of one spent ahead of an even pace, that has the session clean up on cheap agents, then wind down, until the window resets, refusing a workflow at launch meanwhile.
- **Veil** — recording mode: emails, amounts, phone numbers and secrets shown as placeholders while the model still reads the real values.
- **Ward** — before an edit to a file another session changed in the last half hour, a question: proceed, move to a worktree, or cancel.
- **Waypoints** — after each answered turn, up to three next steps the session suggests, each a button that sends it as the next prompt.
- **Whole-index guard** — while another session edits this checkout, a Bash `git add .`, `git add -A`, `git reset` with no path, `git stash`, `git checkout .` or `git clean` is refused, with the path-scoped form to use instead.

### Command reference

Each mod is switched by its own slash command; bare, it flips, and the choice is kept across sessions:

| Command                   | What it does                                                                                                                    |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------ |
| `/commission [on \| off]` | Shows the goal meter while a turn works through a task list                                                                     |
| `/pulse [on \| off]`      | Keeps the machine watcher running, or stops                                                                                     |
| `/resin [on \| off]`      | Shows the cache, context, limits and cost row and its warning toast                                                             |
| `/veil [on \| off]`       | Turns recording mode on or off; off by default                                                                                  |
| `/ward [on \| off]`       | Asks before an edit to a file another session just changed, and refuses a whole-index git command while one shares the checkout |
| `/waypoints [on \| off]`  | Suggests the next steps after each answered turn, or stops                                                                      |

With the band focused (a click or `ctrl+x tab`), `w`, `c` and `h` warm, compact and hand off, `1` to `3` send a waypoint and `g` opens or closes the whole task list.

## <a name="commands">⌨️ Commands</a>

Run from `packages/genshin-mods/`:

```bash
pnpm lint         # lint the package
pnpm lint:fix     # auto-fix lint
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm validate     # claude plugin validate: the engine's own reading of the hooks module
```

## <a name="related">🔗 Related Documentation</a>

- [Claude Code](https://code.claude.com/docs)
- [Vitest](https://vitest.dev/guide/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-mods/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-mods/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-mods/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-mods.svg
