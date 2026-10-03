---
title: Veil
description: Proposal — recording mode; while it is on, email addresses, money amounts, phone numbers and secret-shaped tokens show as placeholders in every message and tool result on screen while the model still reads the real values, and the model is asked to keep them out of its replies.
model: claude-opus-5-5
---

# Veil

Part of [Claude Code mods](/docs/proposals/infra/claude-mods). Recording a session, sharing a screen or streaming one shows everything in the transcript: an address in a git log, a price in a file, a key in an environment dump. Veil covers them on screen without taking them from the model, which still needs the real values to do the work.

## Behaviour

`/veil on` turns it on and `/veil off` turns it off. It is remembered across sessions until switched off, because the moment it matters is the start of a recording, not the start of a session. While it is on:

- **On screen:** every assistant message, user message and tool result is drawn through one pure function that replaces each match with a placeholder naming its kind: `[email]`, `[amount]`, `[phone]`, `[secret]`. The stored transcript and what the model reads are untouched; only the drawing changes.
- **In the model's replies:** a short section of the session's system prompt asks the model to write placeholders for those kinds of values in what it says, so a value the patterns would miss is less likely to be written out at all.
- **In the band:** a marker says veil is on, so a recording never runs with it off by accident.

## What counts

| Kind       | Matches                                                                                 |
| :--------- | :-------------------------------------------------------------------------------------- |
| `[email]`  | Addresses                                                                               |
| `[amount]` | A currency symbol or code before or after a number                                      |
| `[phone]`  | International or grouped phone numbers, not plain integers, version numbers or dates    |
| `[secret]` | Tokens with a known key prefix, and long runs of base64 or hex that read as credentials |

The patterns and their misses are the tests. A miss is cheaper than a false match only up to a point: a hash in a git log veiled as a secret costs the viewer nothing, while an exposed key cannot be taken back. So the secret pattern leans toward matching.

## Files

All new, under `packages/genshin-mods`:

```text
src/veil/registerVeil.ts             the command, the render rewrites and the system-prompt section
src/veil/veilText.ts                 the patterns and their placeholders
src/veil/veilText.test.ts
```

## Notes

- The model's own replies can only be asked, never forced, so the on-screen pass is the guarantee and the system-prompt section is the courtesy. A value inside a diff the engine draws as code is still drawn through the same pass.
- Veil changes nothing the person types. A secret pasted into the prompt is visible in the input box before it is sent, and only the transcript row hides it afterwards.
