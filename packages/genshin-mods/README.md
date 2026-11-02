# genshin-mods

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Claude Code plugin of mods. Five mods draw one band above the prompt, in the session character's colour:

- waypoints: the next steps, one press away
- what the session is spending, with a one-press handoff
- recording mode
- a goal's task list and clock
- a question before an edit to a file that another session just changed

Three guards also run:

- a delegation guard that refuses any subagent not on haiku, and nudges a run of lookups toward a haiku agent
- a disk-scan guard that refuses a Bash scan from a root or a home folder
- a whole-index guard that refuses a git command over the whole index while another session shares the checkout

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/infra/claude-interface/genshin-mods).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

This repository is a Claude Code plugin marketplace named `esposter`. Add it, then install the plugin:

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install genshin-mods@esposter
```

`/sins` scores with [TypeSafe](https://typesafe.ai). It needs a key. Set the key with one of these:

- the plugin's `typesafe_key` option, the same option as [`genshin-persona`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-persona)
- the `TYPESAFE_API_KEY` variable, when the option is empty

Set the option at install:

```bash
claude plugin install genshin-mods@esposter --config typesafe_key=<key>
```

A clone of this repository needs neither command. Once you trust the repository, `.agents/settings.json` enables the plugin at project scope.

With [`genshin-persona`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-persona) installed too, the band takes the session character's colour. Without it, the band uses the game's interface gold.

To develop the plugin from a checkout, run these commands in order. They disable the installed copy, so only one copy answers:

```bash
claude plugin disable genshin-mods@esposter
claude --plugin-dir packages/genshin-mods
```

## <a name="commands">⌨️ Commands</a>

Each mod has its own slash command. With no argument, the command flips the mod. The choice is kept across sessions:

| Command                   | What it does                                                                                                                                |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `/commission [on \| off]` | Shows the goal meter while a turn works through a task list                                                                                 |
| `/pulse [on \| off]`      | Keeps the machine watcher running, or stops                                                                                                 |
| `/resin [on \| off]`      | Shows the cache, context, limits and cost row and its warning toast                                                                         |
| `/sins [on \| off]`       | Scores each prompt's seven sins with TypeSafe, drawn as bars in a pane. Needs the `typesafe_key` option or `TYPESAFE_API_KEY`               |
| `/veil [on \| off]`       | Turns recording mode on or off; off by default                                                                                              |
| `/ward [on \| off]`       | Asks before an edit to a file another session just changed, and refuses a whole-index git command while another session shares the checkout |
| `/waypoints [on \| off]`  | Suggests the next steps after each answered turn, or stops                                                                                  |

Focus the band with a click or `ctrl+x tab`. Then press:

- `w`: warm
- `c`: compact
- `h`: hand off
- `1` to `3`: send a waypoint
- `g`: open or close the whole task list

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-mods/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-mods/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-mods/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-mods.svg
