---
title: Veil
description: Recording mode — while it is on, email addresses, money amounts, phone numbers and secret-shaped tokens show as placeholders in every message and tool result on screen while the model still reads the real values, and the model is asked to keep them out of its replies.
---

# Veil

Part of [Genshin mods](/docs/infra/claude-interface/genshin-mods). Recording a session, sharing a screen or streaming one shows everything in the transcript: an address in a git log, a price in a file, a key in an environment dump. Veil covers them on screen without taking them from the model, which still needs the real values to do the work.

## How to use it

`/veil on` turns it on and `/veil off` turns it off; bare, it flips. It stays on across sessions until switched off, because the moment it matters is the start of a recording rather than of a session. While it is on, a red marker heads the band, so a recording never runs with it off unnoticed.

## How it works

- **On screen:** every assistant message, user message and tool result is drawn through one function that replaces each match with a placeholder naming its kind. The stored transcript and what the model reads are untouched; only the drawing changes, and switching the veil redraws every row already on screen.
- **In the model's replies:** a section of the session's system prompt asks the model to write placeholders for those kinds of values in what it says, so a value the patterns would miss is less likely to be written at all.

| Kind       | Matches                                                                                  |
| :--------- | :--------------------------------------------------------------------------------------- |
| `[email]`  | Addresses                                                                                |
| `[amount]` | A currency symbol or code before or after a number                                       |
| `[phone]`  | International or grouped phone numbers, never a plain integer, a version or a date       |
| `[secret]` | Tokens with a known key prefix, and long runs mixing letters and digits that read as one |

A placeholder holds no digit, at sign or currency sign, so no pattern matches what another wrote and the order they run in changes nothing.

## Key files

| File                                                      | Role                                                       |
| :-------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-mods/src/services/veil/veilText.ts`     | The patterns and their placeholders                        |
| `packages/genshin-mods/src/services/veil/veilValue.ts`    | Every string inside a tool's output veiled, its shape kept |
| `packages/genshin-mods/src/services/veil/registerVeil.ts` | The render rewrites and the system-prompt section          |
| `packages/genshin-mods/src/services/constants.ts`         | The section's words                                        |

## Notes

- The model's own replies can only be asked, never forced, so the on-screen pass is the guarantee and the system-prompt section the courtesy.
- A miss is cheaper than a false match only up to a point: a hash in a git log veiled as a secret costs the viewer nothing, while an exposed key cannot be taken back, so the secret pattern leans toward matching. A path is never veiled, since `/` is outside the long-run pattern.
- Veil changes nothing the person types: a secret pasted into the prompt is visible in the input box before it is sent, and only the transcript row hides it afterwards.
