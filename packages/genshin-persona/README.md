# genshin-persona

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Claude Code plugin that gives every session a Genshin Impact character. The character's spoken lines are read aloud in the character's own cloned voice.

It is an unofficial, non-commercial fan work. It is not affiliated with HoYoverse.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/infra/claude-interface/persona-plugin).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

This repository is a Claude Code plugin marketplace named `esposter`. Add it, then install the plugin:

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install genshin-persona@esposter
```

From the next session, the character is picked and its card is in context.

To update the plugin, run one command. Every merge to `main` is an update:

```bash
claude plugin update genshin-persona@esposter
```

Spoken lines stay silent until the speech engine is set up. The first run of the `voice` verb installs about a gigabyte into the plugin's state directory. Set up the engine once. Use the dub that the reference lines are taken from: `en`, `ja`, `ko` or `zh`:

```bash
/genshin-voice ja
```

Check: the run ends by speaking one sentence as the session's character.

A [TypeSafe](https://typesafe.ai) API key makes the pick use lore instead of the nearest birthday. The key is sensitive. The SDK reads the `TYPESAFE_API_KEY` variable when the `typesafe_key` option is empty. Set the key at install:

```bash
claude plugin install genshin-persona@esposter --config typesafe_key=<key>
```

An install is a copy pinned to one commit. Uncommitted work never reaches it. To develop from a checkout, disable the installed copy and load the checkout directory for the session only, so only one of them answers:

```bash
claude plugin disable genshin-persona@esposter
claude --plugin-dir packages/genshin-persona
```

## <a name="commands">⌨️ Commands</a>

Each command is a slash command: `/genshin-<verb>`. The same verb also runs from a shell, through the plugin's script:

```bash
/genshin-<verb> [argument]
node "<plugin root>/scripts/genshin.mjs" <verb> [argument]
```

A `<name>` is a character's name. It is matched as a whole, ignoring case. It can be in English or as the interface language spells it. A `[language]` is a language that the `language` verb lists. A verb given a name that no character has, or an argument outside its set, prints the reason and exits 1.

| Verb       | Argument                 | What it does                                                                                                                                                                                 |
| :--------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language` | `[language]`             | Sets the interface language, which is the language of every word the plugin writes. It also sets the reply language. With no argument, reports what is set and lists the languages on offer. |
| `mute`     | —                        | Stops the spoken lines of replies from being read aloud. The pick and the card are not changed.                                                                                              |
| `pin`      | `<name>`                 | Fixes one character for every session until unpinned. For this session, it applies from that reply on.                                                                                       |
| `reply`    | `[language]`             | Sets the language that replies are written in, on its own. With no argument, reports what is set, and whether it was set or cascaded from the interface language.                            |
| `roster`   | —                        | Lists every playable character, one line each: name, title, element, region, birthday and the patch that introduced them.                                                                    |
| `status`   | —                        | Reports every setting, and where each value came from. Changes nothing.                                                                                                                      |
| `teardown` | —                        | Removes what `voice` installed: the runtime, the weights, the cached clips and the dub. The picks, the pin and the languages stay. `voice` brings spoken lines back.                         |
| `today`    | —                        | Prints the card of this session's character. From a shell, it prints the card of the pinned character. Without a pin, it prints the card of a fresh pick.                                    |
| `unmute`   | —                        | Lets the spoken lines of replies be read aloud again.                                                                                                                                        |
| `unpin`    | —                        | Removes the pin. The pick decides again from the next session. For this session, it decides from that reply on.                                                                              |
| `use`      | `<name>`                 | Speaks as one character for this session only, from that reply on. Other sessions and the next start do not change.                                                                          |
| `voice`    | `[en \| ja \| ko \| zh]` | Sets up spoken lines in that dub. On the first run, it installs the engine's runtime and weights. It ends by speaking one sentence. With no dub, reports what is set up.                     |
| `volume`   | `<0–100>`                | Sets how loud replies are spoken, as a whole number, from the next reply on. `0` is silence, and the engine is not woken for it.                                                             |

Four more verbs are the authoring queues of one more skill, `genshin-author`. They are script-only, and they are on no menu:

| Verb           | Argument | What it does                                                                                                                   |
| :------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `lines`        | `<name>` | A character's description, and every line of theirs, taken from the game data or the community wiki. Use them to write a card. |
| `uncarded`     | —        | The characters with no persona card, newest first.                                                                             |
| `untranslated` | —        | The characters that the interface language's module has no gerunds or greeting for, newest first.                              |
| `unverbed`     | —        | The cards with no spinner verbs, newest first.                                                                                 |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license]. The plugin holds no image or audio from the game. Its game text is committed as generated slices. The character data comes through an MIT-licensed dependency. Every persona card is written in our own words.

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-persona/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-persona/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-persona/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-persona.svg
