# @esposter/genshin-persona

[![Apache-2.0 licensed][badge-license]][url-license]

A Claude Code plugin that speaks as a Genshin Impact character picked at session start — by lore through a typed decision when you give it a TypeSafe key, by the nearest birthday otherwise — in prose only, never in code, commits or error text, and reads the first sentence of each reply aloud in the character's own cloned voice, by an engine that runs on your machine.

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

The install copies the plugin into the plugin cache and installs its dependencies from the npm lockfile beside this manifest. From the next session the character is picked and its card is in context; nothing else is needed.

Spoken replies stay off until the `voice` verb has set the engine up, once, with the dub the reference lines are taken from — `en`, `ja`, `ko` or `zh`:

```bash
node "<plugin root>/scripts/genshin.ts" voice ja     # or: /genshin-persona:voice ja
```

It installs the engine's runtime and weights — a couple of gigabytes, once — into the plugin's own state directory under `~/.claude/genshin-persona`, never into the plugin, and ends by speaking one sentence as the session's character. Each character is read in a clone of their own voice, conditioned on one line of their performance fetched from the community wiki the first time they are picked and cached beside the weights: the line the repository's measurement chose for them, or the one their card names where someone listened and chose. The engine runs on the GPU through WebGPU and moves down to the CPU one component at a time when what it synthesizes there is not speech or does not load — a provider can run a graph wrong without a word — which the verb and the log report, since the CPU speaks slower. Nothing lifted from the game ships with the plugin. A previous version spoke through an Azure Speech resource; a key stored for it stays in the credential store until it is cleared through `/plugin configure genshin-persona@esposter`, because the plugin cannot reach it.

A TypeSafe key, given as an option, turns the pick over to lore. With a [TypeSafe](https://typesafe.ai) API key the session's character is chosen by one typed decision over the whole roster — weighing the date, a birthday near it, the season's festivals and anniversaries, and your moment: the weekday, the hour, the time zone and the locale — instead of by the nearest birthday alone. The key is sensitive too, and the variable the SDK itself reads, `TYPESAFE_API_KEY`, is honoured when the option is empty:

```bash
claude plugin install genshin-persona@esposter --config typesafe_key=<key>
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/infra/claude-interface/persona-plugin) to level up.

### What it ships

| Component                              | Role                                                                                                                                                                                                    |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hooks/hooks.json`                     | A session-start hook that picks the character, greets you with its name and prints its card as context, and an asynchronous Stop hook that speaks the reply.                                            |
| `output-styles/in-character.md`        | The standing rules, forced on while the plugin is enabled: in character in prose, never in code, with coding kept.                                                                                      |
| `skills/<verb>/SKILL.md`               | One slash command per verb — `/genshin-persona:today`, `roster`, `use`, `pin`, `unpin`, `voice`, `mute`, `unmute`, `volume`, `setup`, `teardown` — for you alone to invoke.                             |
| `skills/genshin/SKILL.md`              | The model's route from a request in words to one of those verbs; hidden from the menu.                                                                                                                  |
| `skills/genshin-author/SKILL.md`       | How a persona card and its spinner lines are written, the command that prints a character's own lines to write from, and the two queues.                                                                |
| `src/personaCards/`                    | Authored persona cards, one typed module per character, in our words: how the character speaks for the model, their spinner verbs and tips for you, and the reference line only where an ear chose one. |
| `src/generated/PersonaReferenceMap.ts` | The measured reference line and its likeness per character, one generated map written by the repository's reference selection and never by hand.                                                        |
| `runtime/`                             | The manifest and lockfile of the speech engine's runtime, which the `voice` verb installs into the state directory rather than the plugin carrying it.                                                  |
| `src/services/baseSpinnerContent.ts`   | The base Teyvat verbs every spinner shows before the character's own, and the tips a card without its own falls back to.                                                                                |
| `scripts/`                             | The hook entrypoints, the commands' script, the status-line script and the resident synthesizer, TypeScript run directly by node.                                                                       |

### Status line and spinner

A plugin cannot ship a status line, spinner verbs or spinner tips, so one command writes them into your user settings, and its twin removes them:

```bash
node "<plugin root>/scripts/genshin.ts" setup      # or: /genshin-persona:setup
node "<plugin root>/scripts/genshin.ts" teardown
```

The status line prints the session's character in their element's colour, from the plugin's state files alone, and shows from the first frame of every session — the birthday pick stands in until the session's record is written, never another session's character. An install lands under a directory named after its version, so the setting points at a launcher in the state directory that every session start re-aims at the running install; a plugin update is followed on the next session with nothing to repeat.

The spinner replaces the built-in verbs and tips with the session's character's: the base Teyvat verbs in `baseSpinnerContent.ts` with the character's own behind them, and the character's tips alone under their name — the tool shows one label over every tip, so the base tips, nobody's line, appear only for a character whose card has none, under the tool's own "Tip". The session-start hook rewrites the two settings whenever the character changes, and so do `use`, `pin` and `unpin`; Claude Code reads the spinner keys once per process, so a rewrite shows from the next session. A status line that is not the plugin's is left alone.

### How the character is picked

Every playable character comes from the game-data dependency — no generated roster, so a new patch is one dependency bump. Loading that dependency is the whole cost of a start, so the roster is cached against its installed version and a bump invalidates the cache by itself. Without a TypeSafe key the character is whoever's birthday is nearest to today by circular distance over the year; a tie goes to the upcoming birthday, then to a choice seeded by the date, so every session started that day agrees. With one, a single typed decision picks from the whole roster at every session start — cheap enough to ask each time, and a little variety between sessions is the point — one attempt with a short ceiling, and anything short of an answer falls back to the birthday pick. The pick is recorded against the session id, so a clear, compact or resume after midnight keeps the character the conversation started with. The Aether and Lumine, who have no birthday, are never picked by distance; when the data cannot be read, no card is printed and the session answers plainly.

### Switching mid-session

`use <name>` makes this session speak as one character from that reply on, and nothing else changes; `pin <name>` fixes one for every session from the next start and this one at once; `unpin` hands both back to the pick:

```bash
node "<plugin root>/scripts/genshin.ts" use furina      # or: /genshin-persona:use furina
```

The command reads the session id Claude Code sets in every Bash subprocess and rewrites that session's record, which the status line, the Stop hook and every later clear, compact or resume read; the card it prints is the one the model answers as from that reply. The spinner alone waits for the next session, because Claude Code reads its keys once per process. A session that started before a pin keeps its own character.

### Spoken replies

The Stop hook hands each reply's first sentence to a resident synthesizer — one process per machine that holds the loaded engine, woken by the session-start hook so the first reply is warm, and gone again after half an hour idle. `mute` and `unmute` decide whether the hook asks it at all. `volume <number>` is a whole number from 0 to 100, applied as a gain, from the next reply on:

```bash
node "<plugin root>/scripts/genshin.ts" volume 60     # or: /genshin-persona:volume 60
```

`teardown` removes the runtime, the weights, the cached clips and the dub along with the status line and spinner settings.

### Commands

Run from `packages/genshin-persona/`:

```bash
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

The plugin holds no image, audio or text from the game: the character data arrives through its MIT-licensed dependency, and every persona card is written in our own words.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
