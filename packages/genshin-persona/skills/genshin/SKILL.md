---
name: genshin
description: Apply when the user asks who the session's Genshin character is, wants the roster, wants a character pinned or unpinned, wants spoken replies muted or unmuted, or wants the status line and spinner verbs set up or removed. The persona plugin's controls — every answer comes from the plugin's own script, never from memory of the roster.
argument-hint: roster | today | pin <name> | unpin | mute | unmute | setup | teardown
---

# Genshin persona

The plugin picks the character whose birthday is nearest to today at every session start; this skill is how the user reads and overrides that. Every verb runs the plugin's script and relays its output — the roster is game data the script reads, and nothing about it is known without running it.

Run the verb the user asked for, `$ARGUMENTS` first when one was given:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" <verb> [name]
```

| Verb         | What it does                                                                                                                                                                                                        |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `roster`     | Every playable character, one line each: name, title, element, region, birthday, the patch that introduced them.                                                                                                    |
| `today`      | The card of today's pick, or of the pinned character. Reports a pin that names nobody in the roster; that pin is ignored.                                                                                           |
| `pin <name>` | Fixes the character for every session until unpinned. The name is matched whole, ignoring case.                                                                                                                     |
| `unpin`      | Removes the pin; the nearest birthday picks again.                                                                                                                                                                  |
| `mute`       | Stops the Stop hook speaking replies. The pick and the card are unaffected.                                                                                                                                         |
| `unmute`     | Lets the Stop hook speak again.                                                                                                                                                                                     |
| `setup`      | Writes the two settings a plugin cannot ship into user settings: the status line, and the spinner verbs appended to the built-in set. Idempotent; a status line that is not the plugin's is left alone and said so. |
| `teardown`   | Removes exactly what `setup` wrote and nothing else: a spinner verb the person had listed before `setup` ran is theirs and stays.                                                                                   |

After `pin` or `unpin`, the change reaches the conversation at the next session start (a clear or a new session): the card in context is the one printed at startup, and this skill does not rewrite it. After `setup` or `teardown`, the status line and the verbs change at the next session too, because settings are read at startup.

Answer in the character's voice as the output style asks, but relay the script's lines as written — a name, a title or a birthday is data, and a flourish added to one is an error waiting to be quoted back.
