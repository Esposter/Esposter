# @esposter/genshin-persona

[![Apache-2.0 licensed][badge-license]][url-license]

A Claude Code plugin that speaks as a Genshin Impact character picked at session start — by lore through a typed decision when you give it a TypeSafe key, by the nearest birthday otherwise — in prose only, never in code, commits or error text, and reads each reply aloud in the character's own cloned voice, a sentence at a time so the reading starts before the reply is finished generating, by an engine that runs on your machine.

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

A clone of this repository needs neither command: `.agents/settings.json` declares the marketplace with the relative source `.` and enables the plugin, so opening the checkout in Claude Code installs it at project scope once you trust the repository, and the plugin is read from the checkout itself.

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

### Command reference

Every command is a slash command in Claude Code and the same verb of the plugin's script from any shell; the script form is what a hook, a terminal or another tool runs, and the two never differ:

```bash
/genshin-persona:<verb> [argument]
node "<plugin root>/scripts/genshin.ts" <verb> [argument]
```

A `<name>` is a character's, matched whole and ignoring case, in English or as the interface language spells it. A `[language]` is one the `language` verb lists, typed in English or in its own words. A verb given a name the roster has no character by, or an argument outside its set, prints why and exits 1; a verb with no argument where one is optional reports instead of changing anything.

| Verb       | Argument                 | What it does                                                                                                                                                                                       |
| :--------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `today`    | —                        | Prints the card of this session's character; from a shell, of the pinned character, else of a fresh pick. A pin naming nobody in the roster is reported and ignored.                               |
| `roster`   | —                        | Every playable character, one line each: name, title, element, region, birthday and the patch that introduced them.                                                                                |
| `use`      | `<name>`                 | Speaks as one character for this session alone, from that reply on; other sessions and the next start are untouched. From a shell, where no session is running, exits 1.                           |
| `pin`      | `<name>`                 | Fixes one character for every session until unpinned, and for this session from that reply on.                                                                                                     |
| `unpin`    | —                        | Removes the pin; the pick decides again from the next session, and for this session from that reply on.                                                                                            |
| `voice`    | `[en \| ja \| ko \| zh]` | Sets up spoken replies in that dub — installing the engine's runtime and weights on the first run, a couple of gigabytes — and ends by speaking one sentence. With no dub, reports what is set up. |
| `mute`     | —                        | Stops replies being spoken. The pick and the card are unaffected.                                                                                                                                  |
| `unmute`   | —                        | Lets replies be spoken again.                                                                                                                                                                      |
| `volume`   | `<0–100>`                | Sets how loud replies are spoken, as a whole number, from the next reply on; `0` is silence the engine is not woken for.                                                                           |
| `language` | `[language]`             | Sets the interface language — every word the plugin writes — and carries the reply language with it. With none, reports what is set and lists the languages on offer.                              |
| `reply`    | `[language]`             | Sets the language replies are written in, on its own. With none, reports what is set and whether it was set or cascaded from the interface language.                                               |
| `status`   | —                        | Reports every setting at once and where each value came from. Changes nothing.                                                                                                                     |
| `setup`    | —                        | Writes the status line and the spinner into user settings, the spinner under this session's character.                                                                                             |
| `teardown` | —                        | Removes exactly what `setup` and `voice` wrote: the two settings, and the voice's runtime, weights, cached clips and dub.                                                                          |

Four more are the authoring queues of one more skill, `genshin-author` — script-only and on no menu:

| Verb           | Argument | What it does                                                                                                                                 |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `lines`        | `<name>` | A character's description and every line of theirs, off the game data or the community wiki, to write a card from.                           |
| `uncarded`     | —        | The characters with no persona card, newest first.                                                                                           |
| `unverbed`     | —        | The cards with no spinner verbs, newest first.                                                                                               |
| `untranslated` | —        | The characters the interface language's module has no gerunds or greeting for, newest first; empty under English, which reads off the cards. |

### What it ships

| Component                              | Role                                                                                                                                                                                           |
| :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/hooks.json`                     | A session-start hook that picks the character, greets you with its name and prints its card as context, and an asynchronous Stop hook that speaks the reply.                                   |
| `output-styles/in-character.md`        | The standing rules, forced on while the plugin is enabled: in character in prose, never in code, with coding kept.                                                                             |
| `skills/<verb>/SKILL.md`               | One slash command per verb, `/genshin-persona:<verb>` — the command reference above — yours to invoke.                                                                                         |
| `skills/genshin/SKILL.md`              | The model's route from a request in words to one of those verbs; hidden from the menu.                                                                                                         |
| `skills/genshin-author/SKILL.md`       | How a persona card and its spinner verbs are written, the command that prints a character's own lines to write from, and the two queues.                                                       |
| `src/personaCards/`                    | Authored persona cards, one typed module per character, in our words: how the character speaks for the model, their spinner verbs for you, and the reference line only where an ear chose one. |
| `src/generated/PersonaReferenceMap.ts` | The measured reference line and its likeness per character, one generated map written by the repository's reference selection and never by hand.                                               |
| `runtime/`                             | The manifest and lockfile of the speech engine's runtime, which the `voice` verb installs into the state directory rather than the plugin carrying it.                                         |
| `src/localizations/`                   | One authored module per language for the words the data package does not carry: the base Teyvat verbs, each character's spinner gerunds, and every line the verbs print.                       |
| `scripts/`                             | The hook entrypoints, the commands' script, the status-line script and the resident synthesizer, TypeScript run directly by node.                                                              |

### Status line and spinner

A plugin cannot ship a status line, spinner verbs or spinner tips, so one command writes them into your user settings, and its twin removes them:

```bash
node "<plugin root>/scripts/genshin.ts" setup      # or: /genshin-persona:setup
node "<plugin root>/scripts/genshin.ts" teardown
```

The status line prints the session's character in their own colour — the one the official art hangs on them, the element's for a character with no colour of their own yet — from the plugin's state files alone, and shows from the first frame of every session — the birthday pick stands in until the session's record is written, never another session's character. An install lands under a directory named after its version, so the setting points at a launcher in the state directory that every session start re-aims at the running install; a plugin update is followed on the next session with nothing to repeat.

The spinner replaces the built-in verbs and tips with the session's character's: the interface language's base Teyvat verbs with the character's own behind them, and under the character's name as that language spells it every line of theirs, off the game data or the community wiki, and for a character with no lines anywhere yet, the game's one-line description of them — outside English that is the newest patches' characters, about a fifth of the roster, until a bump of the data package carries their lines. The session-start hook rewrites the two settings from a detached process whenever the character changes, and so do `use`, `pin` and `unpin`; Claude Code reads the spinner keys once per process, so a rewrite shows from the next session. A status line that is not the plugin's is left alone.

### Languages

Three settings, and they are not one axis. The **interface language** is every word the plugin writes — the card, the spinner's verbs and tips, the status line and each verb's own output — and it is the master toggle; the **reply language** is what the model writes prose in, and follows the interface language until it is set on its own; the **dub** says whose voice reads a reply and is neither, because it comes from a set of four and costs an install:

```bash
node "<plugin root>/scripts/genshin.ts" language japanese   # or: /genshin-persona:language japanese
node "<plugin root>/scripts/genshin.ts" reply english       # labels in one language, prose in another
node "<plugin root>/scripts/genshin.ts" status              # every setting, and where each value came from
```

The languages on offer are read off the data package rather than listed anywhere, so a bump that adds one is a language the plugin speaks with nothing to edit; `language` with no argument prints them, each in its own words beside the word you type for it — `Japanese (日本語)` — and either resolves. Everything that package carries — each character's name, title, element, region, description and every one of their own voice lines, which are the spinner's tips — arrives localized for nothing. The words that are ours do not: the base Teyvat verbs, each character's spinner gerunds and the verbs' own output live in one authored module per language under `src/localizations/`, and English and Japanese are written. A language with no module still localizes everything the data package answers and falls back to English per string for the rest, so a half-translated language is a legal state rather than a broken one.

The interface language never changes the dub: setting one a dub exists for says so and names the command, and setting any other says plainly that replies keep reading in whichever voice is already set up. Of the authored card it reaches only the greeting, the one line of it the welcome shows the person; the habits and sign-off reach the model alone and follow the reply language by themselves, untranslated.

### How the character is picked

Every playable character comes from the game-data dependency — no generated roster, so a new patch is one dependency bump. Loading that dependency is the whole cost of a start, so the roster is cached against its installed version and a bump invalidates the cache by itself. Without a TypeSafe key the character is whoever's birthday is nearest to today by circular distance over the year; a tie goes to the upcoming birthday, then to a choice seeded by the date, so every session started that day agrees. With one, a single typed decision picks from the whole roster at every session start — cheap enough to ask each time, and a little variety between sessions is the point — one attempt with a short ceiling, and anything short of an answer falls back to the birthday pick. The pick is recorded against the session id, so a clear, compact or resume after midnight keeps the character the conversation started with. The Aether and Lumine, who have no birthday, are never picked by distance; when the data cannot be read, no card is printed and the session answers plainly.

### Switching mid-session

`use <name>` makes this session speak as one character from that reply on, and nothing else changes; `pin <name>` fixes one for every session from the next start and this one at once; `unpin` hands both back to the pick:

```bash
node "<plugin root>/scripts/genshin.ts" use furina      # or: /genshin-persona:use furina
```

The command reads the session id Claude Code sets in every Bash subprocess and rewrites that session's record, which the status line, the Stop hook and every later clear, compact or resume read; the card it prints is the one the model answers as from that reply. The spinner alone waits for the next session, because Claude Code reads its keys once per process. A session that started before a pin keeps its own character.

### Spoken replies

The Stop hook hands each reply's prose to a resident synthesizer — one process per machine that holds the loaded engine, woken by the session-start hook so the first reply is warm, and gone again after half an hour idle — which reads it one sentence at a time, playing each while the next is generated. `mute` and `unmute` decide whether the hook asks it at all, and so does a `volume` of zero, which is silence the engine should not be woken for. `volume <number>` is a whole number from 0 to 100, applied as a gain, from the next reply on:

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
