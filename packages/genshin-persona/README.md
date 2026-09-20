# @esposter/genshin-persona

[![Apache-2.0 licensed][badge-license]][url-license]

A Claude Code plugin that speaks as the Genshin Impact character whose birthday is nearest to today — in prose only, never in code, commits or error text — and reads the first sentence of each reply aloud through Azure Speech.

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

The install copies the plugin into the plugin cache and installs its one dependency, the game-data package, from the npm lockfile beside this manifest. From the next session the character is picked and its card is in context; nothing else is needed.

Spoken replies stay off until the plugin knows an Azure Speech resource — a free-tier one covers thousands of replies a month. Pass the options at install time, or later through `/plugin configure genshin-persona@esposter`:

```bash
claude plugin install genshin-persona@esposter \
  --config speech_endpoint=https://<region>.tts.speech.microsoft.com \
  --config speech_key=<key>
```

The key is marked sensitive, so it lands in the credential store rather than a settings file. A third option, the voice, picks the neural voice by its Azure short name and defaults to an Australian English one.

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/infra/claude-interface/persona-plugin) to level up.

### What it ships

| Component                        | Role                                                                                                                    |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `hooks/hooks.json`               | A session-start hook that picks the character and prints its card, and an asynchronous Stop hook that speaks the reply. |
| `output-styles/traveler.md`      | The standing rules, forced on while the plugin is enabled: in character in prose, never in code, with coding kept.      |
| `skills/genshin/SKILL.md`        | `/genshin-persona:genshin` — the roster, today's pick, pin and unpin, mute and unmute.                                  |
| `skills/genshin-author/SKILL.md` | How a character's voice card is written, and the command listing the characters that have none yet.                     |
| `cards/`                         | Authored voice cards, one per character that has earned one, in our words about how the character speaks.               |
| `scripts/`                       | The hook entrypoints, the skill's command and the status-line script, TypeScript run directly by node.                  |

### Status line

A plugin cannot set a status line, so the one-line setting lives in your user settings and points at the plugin's script, which prints the session's character from the state files alone:

```json
{
  "statusLine": { "type": "command", "command": "node \"<plugin root>/scripts/status.ts\"" }
}
```

### How the character is picked

Every playable character comes from the game-data dependency at session start — no generated roster, so a new patch is one dependency bump. The pick is whoever's birthday is nearest to today by circular distance over the year; a tie goes to the upcoming birthday, then to a choice seeded by the date so every session started that day agrees. The pick is recorded against the session id, so a clear, compact or resume after midnight keeps the character the conversation started with. The Traveler, who has no birthday, is never picked by distance and is the card printed when the data cannot be read.

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
