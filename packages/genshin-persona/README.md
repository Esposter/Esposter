# @esposter/genshin-persona

[![Apache-2.0 licensed][badge-license]][url-license]

A Claude Code plugin that gives every session a Genshin Impact character: a reply to a question for the assistant opens with one spoken line in their voice and answers plainly, a reply to a question for the character — a joke, a hello — is all spoken lines, and every line is read aloud in the character's own cloned voice by an engine on your machine.

- **A character per session** — picked by the nearest birthday, or by lore through one typed decision when you give it a TypeSafe key; `use` and `pin` override the pick.
- **A spoken channel, not a persona in the prose** — the character speaks in blockquote lines and nowhere else: one line opening an answer a reader will use, with everything else — the answer, the code, the commit message — a neutral assistant's, and the whole reply when the ask was the character's.
- **Read aloud as it is written** — a hook hands each spoken line to a resident synthesizer the moment its line lands, and the line is read in the character's cloned voice while the reply is still streaming; the engine is warmed at the session start so the first reply pays no load.
- **Localized** — the card, the spinner, the status line and every line the plugin prints in the language you set, and replies in the one you choose.

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

From the next session the character is picked and its card is in context; nothing else is needed. A clone of this repository needs neither command: `.agents/settings.json` declares the marketplace with the relative source `.` and enables the plugin, so opening the checkout in Claude Code installs it at project scope once you trust the repository.

Updating is one command, which refreshes the marketplace itself; the plugin declares no version, so every merge to `main` is an update, and the next session loads it:

```bash
claude plugin update genshin-persona@esposter
```

Developing the plugin from a checkout is the one case the install does not serve: an install is a copy pinned to a commit, so uncommitted work never reaches it. Load the directory itself for the session instead, with the installed copy disabled so only one of them answers:

```bash
claude plugin disable genshin-persona@esposter
claude --plugin-dir packages/genshin-persona
```

To stop running it, switch auto-update on once for this marketplace — `/plugin`, **Marketplaces**, `esposter`, **Enable auto-update** — which Claude Code leaves off for any marketplace that is not Anthropic's; the plugin then follows `main` in the background and loads on the launch after. Nothing below is repeated for an update: the state directory's launchers re-aim at the running copy at every session start, and the voice's runtime and weights are kept until the copy carries a newer lockfile or engine, which `voice` with no argument reports and `voice <dub>` run again picks up, installing only what changed.

Spoken lines stay silent until the `voice` verb has set the engine up, once, with the dub the reference lines are taken from — `en`, `ja`, `ko` or `zh`:

```bash
node "<plugin root>/scripts/genshin.ts" voice ja     # or: /genshin-persona:voice ja
```

It installs the engine's runtime and weights — about a gigabyte, once — into the plugin's own state directory under `~/.claude/genshin-persona`, ends by speaking one sentence as the session's character, and writes the hook that reads each reply's spoken lines into your user settings, which Claude Code reads once per process, so replies are read from the next session. Each character is read in a clone of their own voice, conditioned on one line of their performance fetched from the community wiki the first time they are picked; nothing lifted from the game ships with the plugin. How the engine runs, which device it settles on and why, and what it does when it cannot speak is the [spoken replies](https://esposter.com/docs/infra/claude-interface/spoken-replies) page.

A [TypeSafe](https://typesafe.ai) API key, given as an option, turns the pick over to lore — one typed decision over the whole roster, weighing the date, the season's festivals and your moment — instead of the nearest birthday. The key is sensitive, and the variable the SDK itself reads, `TYPESAFE_API_KEY`, is honoured when the option is empty:

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

| Verb       | Argument                 | What it does                                                                                                                                                                                                                                                                    |
| :--------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `today`    | —                        | Prints the card of this session's character; from a shell, of the pinned character, else of a fresh pick. A pin naming nobody in the roster is reported and ignored.                                                                                                            |
| `roster`   | —                        | Every playable character, one line each: name, title, element, region, birthday and the patch that introduced them.                                                                                                                                                             |
| `use`      | `<name>`                 | Speaks as one character for this session alone, from that reply on; other sessions and the next start are untouched. From a shell, where no session is running, exits 1.                                                                                                        |
| `pin`      | `<name>`                 | Fixes one character for every session until unpinned, and for this session from that reply on.                                                                                                                                                                                  |
| `unpin`    | —                        | Removes the pin; the pick decides again from the next session, and for this session from that reply on.                                                                                                                                                                         |
| `voice`    | `[en \| ja \| ko \| zh]` | Sets up spoken lines in that dub — installing the engine's runtime and weights on the first run, about a gigabyte — ends by speaking one sentence, and writes the hook that reads each reply into user settings, on from the next session. With no dub, reports what is set up. |
| `mute`     | —                        | Stops replies' spoken lines being read aloud. The pick and the card are unaffected.                                                                                                                                                                                             |
| `unmute`   | —                        | Lets replies' spoken lines be read aloud again.                                                                                                                                                                                                                                 |
| `volume`   | `<0–100>`                | Sets how loud replies are spoken, as a whole number, from the next reply on; `0` is silence the engine is not woken for.                                                                                                                                                        |
| `language` | `[language]`             | Sets the interface language — every word the plugin writes — and carries the reply language with it. With none, reports what is set and lists the languages on offer.                                                                                                           |
| `reply`    | `[language]`             | Sets the language replies are written in, on its own. With none, reports what is set and whether it was set or cascaded from the interface language.                                                                                                                            |
| `status`   | —                        | Reports every setting at once and where each value came from. Changes nothing.                                                                                                                                                                                                  |
| `setup`    | —                        | Writes the status line and the spinner into user settings, the spinner under this session's character.                                                                                                                                                                          |
| `teardown` | —                        | Removes exactly what `setup` and `voice` wrote: the three settings, and the voice's runtime, weights, cached clips and dub.                                                                                                                                                     |

Four more are the authoring queues of one more skill, `genshin-author` — script-only and on no menu:

| Verb           | Argument | What it does                                                                                                                                 |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `lines`        | `<name>` | A character's description and every line of theirs, off the game data or the community wiki, to write a card from.                           |
| `uncarded`     | —        | The characters with no persona card, newest first.                                                                                           |
| `unverbed`     | —        | The cards with no spinner verbs, newest first.                                                                                               |
| `untranslated` | —        | The characters the interface language's module has no gerunds or greeting for, newest first; empty under English, which reads off the cards. |

### What it ships

| Component                              | Role                                                                                                                                                                                                                          |
| :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/hooks.json`                     | A session-start hook that picks the character, greets you with its name, what the pick weighed and who is close, and prints its card as context. The hook that reads a reply's spoken lines is a user setting `voice` writes. |
| `output-styles/in-character.md`        | The standing rules, forced on while the plugin is enabled: a blockquote line is the character's spoken line, the ask decides how much of a reply that is, and the rest is plain.                                              |
| `skills/<verb>/SKILL.md`               | One slash command per verb, `/genshin-persona:<verb>` — the command reference above — yours to invoke.                                                                                                                        |
| `skills/genshin/SKILL.md`              | The model's route from a request in words to one of those verbs; hidden from the menu.                                                                                                                                        |
| `skills/genshin-author/SKILL.md`       | How a persona card and its spinner verbs are written, the command that prints a character's own lines to write from, and the two queues.                                                                                      |
| `src/personaCards/`                    | Authored persona cards, one typed module per character, in our words: how the character speaks for the model, their spinner verbs for you, and the reference line only where an ear chose one.                                |
| `src/generated/PersonaReferenceMap.ts` | The measured reference line and its likeness per character, one generated map written by the repository's reference selection and never by hand.                                                                              |
| `runtime/`                             | The manifest and lockfile of the speech engine's runtime, which the `voice` verb installs into the state directory rather than the plugin carrying it.                                                                        |
| `src/localizations/`                   | One authored module per language for the words the data package does not carry: the base Teyvat verbs, each character's spinner gerunds, and every line the verbs print.                                                      |
| `scripts/`                             | The hook entrypoints, the commands' script, the status-line script, the spinner rewrite and the resident synthesizer, TypeScript run directly by node.                                                                        |

### Status line and spinner

A plugin cannot ship a status line, spinner verbs or spinner tips, so one command writes them into your user settings, and its twin removes them:

```bash
node "<plugin root>/scripts/genshin.ts" setup      # or: /genshin-persona:setup
node "<plugin root>/scripts/genshin.ts" teardown
```

The status line prints the session's character in their own colour from the plugin's state files alone, and the spinner shows the character's own verbs and lines under their name. Both follow a plugin update on the next session, and the spinner follows a change of character on the next session too, since Claude Code reads its keys once per process. Why each is shaped as it is: the [persona plugin](https://esposter.com/docs/infra/claude-interface/persona-plugin) page.

### Languages

Three settings, and they are not one axis: the **interface language** is every word the plugin writes and the master toggle, the **reply language** is what the model writes in and follows the interface language until set on its own, and the **dub** says whose voice reads a line and is neither, because it comes from a set of four and costs an install:

```bash
node "<plugin root>/scripts/genshin.ts" language japanese   # or: /genshin-persona:language japanese
node "<plugin root>/scripts/genshin.ts" reply english       # labels in one language, prose in another
node "<plugin root>/scripts/genshin.ts" status              # every setting, and where each value came from
```

The languages on offer are the data package's, so `language` with no argument lists them, each in its own words beside the word you type for it, and either resolves. What arrives localized for nothing and what is written by hand per language is the [persona plugin](https://esposter.com/docs/infra/claude-interface/persona-plugin) page's.

### How the character is picked

Every playable character comes from the game-data dependency — no generated roster, so a new patch is one dependency bump. Without a TypeSafe key the character is whoever's birthday is nearest to today, and the welcome names the other birthdays of the week ahead; with one, a single typed decision picks from the whole roster at every session start, and the welcome charts its answer — the choice and the nearest runners-up with their probabilities — or says why the tier gave none and the birthday pick stood in. Once `voice` has set a dub up, the welcome carries one line about it too. The pick is recorded against the session id, so a clear, compact or resume after midnight keeps the character the conversation started with.

### Switching mid-session

`use <name>` makes this session speak as one character from that reply on; `pin <name>` fixes one for every session from the next start and this one at once; `unpin` hands both back to the pick:

```bash
node "<plugin root>/scripts/genshin.ts" use furina      # or: /genshin-persona:use furina
```

### Spoken lines

A reply to an ask of the assistant opens with one blockquote line in the character's voice and may close with one; a reply to an ask of the character — a joke, a hello, an opinion, however much was pasted to form it — is such lines and nothing else, as many as the ask deserves, a list of them included. A hook hands each piece of the reply to a resident synthesizer as it lands, which reads the lines in the order they were written, in the character's cloned voice, while the reply is still being written. `mute` and `unmute` decide whether the hook asks it at all, and so does a `volume` of zero. `volume <number>` is a whole number from 0 to 100, applied as a gain, from the next reply on:

```bash
node "<plugin root>/scripts/genshin.ts" volume 60     # or: /genshin-persona:volume 60
```

`teardown` removes the runtime, the weights, the cached clips, the dub and the hook along with the status line and spinner settings.

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
