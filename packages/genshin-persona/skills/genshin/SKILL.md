---
name: genshin
description: Apply when the user asks who the session's Genshin character is, wants the roster, wants a character pinned or unpinned, wants spoken replies muted, unmuted, louder or softer, or wants the status line and spinner set up or removed. The persona plugin's controls — every answer comes from the plugin's own script, never from memory of the roster.
argument-hint: roster | today | pin <name> | unpin | mute | unmute | volume <level> | setup | teardown
---

# Genshin persona

The plugin picks a character at every session start — by lore through a typed decision when a TypeSafe key is configured, by the nearest birthday otherwise; this skill is how the user reads and overrides that. Every verb runs the plugin's script and relays its output — the roster is game data the script reads, and nothing about it is known without running it.

Run the verb the user asked for, `$ARGUMENTS` first when one was given:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" <verb> [name]
```

| Verb             | What it does                                                                                                                                                                                                                                                                                                |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `roster`         | Every playable character, one line each: name, title, element, region, birthday, the patch that introduced them.                                                                                                                                                                                            |
| `today`          | The card of the pinned character, else of a fresh pick — under the lore pick, one answer the next session need not repeat. Reports a pin that names nobody in the roster; that pin is ignored.                                                                                                              |
| `pin <name>`     | Fixes the character for every session until unpinned. The name is matched whole, ignoring case.                                                                                                                                                                                                             |
| `unpin`          | Removes the pin; the pick decides again from the next session.                                                                                                                                                                                                                                              |
| `mute`           | Stops the Stop hook speaking replies. The pick and the card are unaffected.                                                                                                                                                                                                                                 |
| `unmute`         | Lets the Stop hook speak again.                                                                                                                                                                                                                                                                             |
| `volume <level>` | Sets how loud replies are spoken: `silent`, `x-soft`, `soft`, `medium`, `loud`, `x-loud`, `default`, or a whole number from 0 to 100. Takes effect from the next reply; `mute` is the one that stops the call to the speech service.                                                                        |
| `setup`          | Writes the settings a plugin cannot ship into user settings: the status line, and the spinner — Teyvat verbs and tips with the current character's own behind them, under the character's name. The spinner keys are taken over outright; a status line that is not the plugin's is left alone and said so. |
| `teardown`       | Removes exactly what `setup` wrote and nothing else.                                                                                                                                                                                                                                                        |

The authoring verbs — `uncarded`, `untipped` and `lines <name>` — are the `genshin-author` skill's.

After `pin` or `unpin`, the change reaches the conversation at the next session start (a clear or a new session): the card in context is the one printed at startup, and this skill does not rewrite it; only the status line follows a pin at once. A `volume` change reaches the next spoken reply. After `setup` or `teardown`, the status line and the spinner change at the next session too, because settings are read at startup; from then on every session start re-aims the spinner at the session's character.

Answer in the character's voice as the output style asks, but relay the script's lines as written — a name, a title or a birthday is data, and a flourish added to one is an error waiting to be quoted back.
