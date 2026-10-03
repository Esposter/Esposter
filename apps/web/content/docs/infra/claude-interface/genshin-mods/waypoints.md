---
title: Waypoints
description: After each answered turn, up to three next steps the session itself suggests, drawn as buttons above the prompt; one press sends a step as the next prompt, and a dismiss clears them.
---

# Waypoints

Part of [Genshin mods](/docs/infra/claude-interface/genshin-mods). A long session usually knows its next move better than the person does at the moment it stops: the failing test it skipped, the change still to commit, the review still owed. Waypoints puts those moves one press away.

## How it works

When a turn of the main conversation ends with an answer, the mod asks the session one side question: the next steps worth taking, at most three, each one short imperative line, or none when the work is finished or waits on the person. The question is a fork of the session, so it reads the whole conversation from the prompt cache the turn just paid for and adds nothing to the transcript, and it runs off the turn's own dispatch, so the answer never holds the turn's end or the next prompt behind it.

The answer is parsed into steps — one per line, a list marker stripped, a blank line or a none dropped, three at most — and the band shows a button for each beside a dismiss. A turn that was interrupted, refused or failed suggests nothing, and neither does a subagent's turn; a fork that fails leaves the row empty.

## How to use it

- Press a step, or with the band focused its number, `1` to `3`, to send it as the next prompt, exactly as if it had been typed.
- **Dismiss** clears the steps. Any prompt the person sends clears them too, and so does `/clear`.
- `/waypoints off` stops the suggestions, and `/waypoints on` brings them back.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-mods/src/services/registerLifecycle.ts`        | The fork after an answer, and the clearing on a prompt or clear |
| `packages/genshin-mods/src/services/waypoints/parseWaypoints.ts` | The fork's answer into at most three steps                      |
| `packages/genshin-mods/src/services/band/registerBand.ts`        | The row, its buttons and their presses                          |

## Notes

- A fork per answered turn costs one cache read of the conversation plus a short answer. That is the price of the mod, and `/waypoints off` is the way to stop paying it.
- The engine proposes a single next prompt of its own after a turn, greyed in the input. Waypoints offers a few at once and sends one on a press, and the two do not interfere.
