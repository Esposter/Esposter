# @esposter/genshin-persona

[![Apache-2.0 licensed][badge-license]][url-license]

A Claude Code plugin that speaks as a Genshin Impact character picked for the day — by lore through a typed decision when you give it a TypeSafe key, by the nearest birthday otherwise — in prose only, never in code, commits or error text, and reads the first sentence of each reply aloud through Azure Speech.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

This repository is a Claude Code plugin marketplace named `esposter`, and this package is its one plugin:

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install genshin-persona@esposter
```

The install copies the plugin into the plugin cache and installs its two dependencies, the game-data package and the TypeSafe SDK, from the npm lockfile beside this manifest. From the next session the character is picked and its card is in context; nothing else is needed.

Spoken replies stay off until the plugin knows an Azure Speech resource — a free-tier one covers thousands of replies a month. Pass the options at install time, or later through `/plugin configure genshin-persona@esposter`:

```bash
claude plugin install genshin-persona@esposter \
  --config speech_endpoint=https://<region>.tts.speech.microsoft.com \
  --config speech_key=<key>
```

The key is marked sensitive, so it lands in the credential store rather than a settings file. A third option, the voice, picks the neural voice by its Azure short name and defaults to an Australian English one.

A fourth option turns the pick over to lore. With a [TypeSafe](https://typesafe.ai) API key the day's character is chosen by one typed decision over the whole roster — weighing the date, a birthday near it, the season's festivals and anniversaries, and your moment: the weekday, the hour, the time zone and the locale — instead of by the nearest birthday alone. The key is sensitive too, and the variable the SDK itself reads, `TYPESAFE_API_KEY`, is honoured when the option is empty:

```bash
claude plugin install genshin-persona@esposter --config typesafe_key=<key>
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/infra/claude-interface/persona-plugin) to level up.

### What it ships

| Component                        | Role                                                                                                                                                         |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/hooks.json`               | A session-start hook that picks the character, greets you with its name and prints its card as context, and an asynchronous Stop hook that speaks the reply. |
| `output-styles/traveler.md`      | The standing rules, forced on while the plugin is enabled: in character in prose, never in code, with coding kept.                                           |
| `skills/genshin/SKILL.md`        | `/genshin-persona:genshin` — the roster, the day's pick, pin and unpin, mute, unmute and volume, setup and teardown.                                         |
| `skills/genshin-author/SKILL.md` | How a voice card and its spinner lines are written, the command that prints a character's own lines to write from, and the two queues.                       |
| `cards/`                         | Authored voice cards, one per character, in our words: how the character speaks for the model, and their spinner verbs and tips for you.                     |
| `spinner.md`                     | The base Teyvat verbs and tips every character's spinner shows before their own.                                                                             |
| `scripts/`                       | The hook entrypoints, the skill's command and the status-line script, TypeScript run directly by node.                                                       |

### Status line and spinner

A plugin cannot ship a status line, spinner verbs or spinner tips, so one command writes them into your user settings, and its twin removes them:

```bash
node "<plugin root>/scripts/genshin.ts" setup      # or ask: /genshin-persona:genshin setup
node "<plugin root>/scripts/genshin.ts" teardown
```

The status line prints the session's character in their element's colour, from the plugin's state files alone, and shows from the first frame of every session but the first of a day. An install lands under a directory named after its version, so the setting points at a launcher in the state directory that every session start re-aims at the running install; a plugin update is followed on the next session with nothing to repeat.

The spinner replaces the built-in verbs and tips with Teyvat's — the base list in `spinner.md` — and, behind them, the session's character's own verbs and tips from their card, labelled with the character's name. The session-start hook rewrites the two settings and the tips file whenever the character changes, so the spinner follows the calendar like everything else. A status line that is not the plugin's is left alone.

### How the character is picked

Every playable character comes from the game-data dependency at session start — no generated roster, so a new patch is one dependency bump. The pick is the day's: the first session of a day settles it in a state file and every later session that day reads it back. Without a TypeSafe key the day's character is whoever's birthday is nearest to today by circular distance over the year; a tie goes to the upcoming birthday, then to a choice seeded by the date. With one, a single typed decision picks from the whole roster, one attempt with a short ceiling, and anything short of an answer falls back to the birthday pick. The pick is also recorded against the session id, so a clear, compact or resume after midnight keeps the character the conversation started with. The Traveler, who has no birthday, is never picked by distance and is the card printed when the data cannot be read.

### Spoken replies

`mute` and `unmute` decide whether the Stop hook calls the speech service at all. `volume <level>` shapes the voice through the speech markup's own levels — `silent`, `x-soft`, `soft`, `medium`, `loud`, `x-loud`, `default` — or a whole number from 0 to 100, from the next reply on:

```bash
node "<plugin root>/scripts/genshin.ts" volume loud     # or ask: /genshin-persona:genshin volume loud
```

### Commands

Run from `packages/genshin-persona/`:

```bash
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

The plugin holds no image, audio or text from the game: the character data arrives through its MIT-licensed dependency, and every voice card is written in our own words.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
