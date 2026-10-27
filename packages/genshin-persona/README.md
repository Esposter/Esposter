# genshin-persona

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Claude Code plugin that gives every session a Genshin Impact character, whose spoken lines are read aloud in their own cloned voice.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/infra/claude-interface/persona-plugin).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

This repository is a Claude Code plugin marketplace named `esposter`:

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install genshin-persona@esposter
```

From the next session the character is picked and its card is in context. Updating is one command, and every merge to `main` is an update:

```bash
claude plugin update genshin-persona@esposter
```

Spoken lines stay silent until the `voice` verb has set the speech engine up, once, with the dub the reference lines are taken from: `en`, `ja`, `ko` or `zh`. The first run installs about a gigabyte into the plugin's state directory, and ends by speaking one sentence as the session's character:

```bash
/genshin-voice ja
```

A [TypeSafe](https://typesafe.ai) API key turns the pick over to lore, instead of the nearest birthday. The key is sensitive, and the variable the SDK reads, `TYPESAFE_API_KEY`, is honoured when the option is empty:

```bash
claude plugin install genshin-persona@esposter --config typesafe_key=<key>
```

An install is a copy pinned to a commit, so uncommitted work never reaches it. To develop from a checkout, disable the installed copy and load the directory for the session, so only one of them answers:

```bash
claude plugin disable genshin-persona@esposter
claude --plugin-dir packages/genshin-persona
```

## <a name="commands">⌨️ Commands</a>

Each command is a slash command, `/genshin-<verb>`, and the same verb runs from any shell through the plugin's script:

```bash
/genshin-<verb> [argument]
node "<plugin root>/scripts/genshin.mjs" <verb> [argument]
```

A `<name>` is a character's, matched whole and ignoring case, in English or as the interface language spells it. A `[language]` is one the `language` verb lists. A verb given a name the roster has no character by, or an argument outside its set, prints why and exits 1.

| Verb       | Argument                 | What it does                                                                                                                                                                                          |
| :--------- | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language` | `[language]`             | Sets the interface language, every word the plugin writes, and carries the reply language with it. With none, reports what is set and lists the languages on offer.                                   |
| `mute`     | —                        | Stops replies' spoken lines being read aloud. The pick and the card are unaffected.                                                                                                                   |
| `pin`      | `<name>`                 | Fixes one character for every session until unpinned, and for this session from that reply on.                                                                                                        |
| `reply`    | `[language]`             | Sets the language replies are written in, on its own. With none, reports what is set and whether it was set or cascaded from the interface language.                                                  |
| `roster`   | —                        | Every playable character, one line each: name, title, element, region, birthday and the patch that introduced them.                                                                                   |
| `status`   | —                        | Reports every setting at once and where each value came from. Changes nothing.                                                                                                                        |
| `teardown` | —                        | Removes what `voice` installed: the runtime, the weights, the cached clips and the dub, and the viewer's setup. The picks, the pin and the languages stay; `voice` brings spoken lines back.          |
| `today`    | —                        | Prints the card of this session's character; from a shell, of the pinned character, else of a fresh pick.                                                                                             |
| `unmute`   | —                        | Lets replies' spoken lines be read aloud again.                                                                                                                                                       |
| `unpin`    | —                        | Removes the pin. The pick decides again from the next session, and for this session from that reply on.                                                                                               |
| `use`      | `<name>`                 | Speaks as one character for this session alone, from that reply on. Other sessions and the next start are untouched.                                                                                  |
| `viewer`   | `[address] [model]`      | Shows each spoken line as a bubble on a Live2DViewerEX model and sounds it there, the stock player as the fallback. `viewer motions <attention \| turnEnd> <group:motion>` maps a motion to a moment. |
| `voice`    | `[en \| ja \| ko \| zh]` | Sets up spoken lines in that dub, installing the engine's runtime and weights on the first run, and ends by speaking one sentence. With no dub, reports what is set up.                               |
| `volume`   | `<0–100>`                | Sets how loud replies are spoken, as a whole number, from the next reply on. `0` is silence the engine is not woken for.                                                                              |

Four more are the authoring queues of one more skill, `genshin-author`. They are script-only and on no menu:

| Verb           | Argument | What it does                                                                                                       |
| :------------- | :------- | :----------------------------------------------------------------------------------------------------------------- |
| `lines`        | `<name>` | A character's description and every line of theirs, off the game data or the community wiki, to write a card from. |
| `uncarded`     | —        | The characters with no persona card, newest first.                                                                 |
| `untranslated` | —        | The characters the interface language's module has no gerunds or greeting for, newest first.                       |
| `unverbed`     | —        | The cards with no spinner verbs, newest first.                                                                     |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license]. The plugin holds no image or audio from the game. Its game text is committed as generated slices, the character data arrives through an MIT-licensed dependency, and every persona card is written in our own words.

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-persona/latest?color=038758
[url-npm]: https://www.npmjs.com/package/genshin-persona/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-persona/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-persona.svg
