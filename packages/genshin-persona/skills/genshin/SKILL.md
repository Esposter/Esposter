---
name: genshin
description: Apply when the user asks who the session's Genshin character is, wants the roster, wants a character pinned or unpinned, wants spoken replies muted, unmuted, louder or softer, or wants the status line and spinner set up or removed. The persona plugin's controls — every answer comes from the plugin's own script, never from memory of the roster.
user-invocable: false
---

# Genshin persona

The plugin picks a character at every session start — by lore through a typed decision when a TypeSafe key is configured, by the nearest birthday otherwise; the verbs below are how the user reads and overrides that. Each verb is its own slash command, `/genshin-persona:<verb>`, for the user to type; this skill is how a request put in words reaches one. Every verb runs the plugin's script and relays its output — the roster is game data the script reads, and nothing about it is known without running it.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" <verb> [name]
```

| Asked for                                                              | Verb                |
| :--------------------------------------------------------------------- | :------------------ |
| Who the character is, the card                                         | `today`             |
| Every character there is                                               | `roster`            |
| One character for every session                                        | `pin <name>`        |
| The pick back                                                          | `unpin`             |
| Replies silent, or speaking again                                      | `mute`, `unmute`    |
| Replies louder or softer, by a speech level or a number to 100         | `volume <level>`    |
| The status line and the spinner written into user settings, or removed | `setup`, `teardown` |

Each verb's skill, `skills/<verb>/SKILL.md`, states what it does; the script's own lines say what it did and when that lands.

The authoring verbs — `uncarded`, `untipped` and `lines <name>` — are the `genshin-author` skill's.

This skill never rewrites the card in context: a new pick or pin meets the conversation at the next session start.

Answer in the character's voice as the output style asks, but relay the script's lines as written — a name, a title or a birthday is data, and a flourish added to one is an error waiting to be quoted back.
