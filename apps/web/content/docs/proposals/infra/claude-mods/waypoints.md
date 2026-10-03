---
title: Waypoints
description: Proposal — after each answered turn, up to three next steps the session itself suggests, drawn as buttons above the prompt; one press sends a step as the next prompt, and a dismiss clears them.
model: claude-opus-5-5
---

# Waypoints

Part of [Claude Code mods](/docs/proposals/infra/claude-mods). A long session usually knows its next move better than the person does at the moment it stops: the failing test it skipped, the change still to commit, the review still owed. Waypoints puts those moves one press away.

## Behaviour

When a turn of the main conversation ends with an answer, the mod asks the session one side question: the next steps worth taking, at most three, each one short imperative line, or none when the work is finished or waiting on the person. The question is a fork of the session, so it reads the whole conversation from the prompt cache the turn just paid for and adds nothing to the transcript.

The band then shows one button per step, numbered so a bare digit in an empty prompt presses it, and a dismiss button. A press sends that step as the next prompt, exactly as if it had been typed. Any prompt the person sends clears the steps, and so do a dismiss, a `/clear` and the start of the next turn.

A turn that was interrupted, refused or failed suggests nothing, and neither does a subagent's turn. A fork that fails, or answers in a shape that does not parse into lines, leaves the band empty rather than showing an error. The person's own next prompt is always the fallback.

## State and switching

| State       | Holds                                         |
| :---------- | :-------------------------------------------- |
| `waypoints` | The steps on offer, empty when there are none |
| `isEnabled` | `/waypoints on` or `off`, kept in the store   |

Parsing the fork's answer into steps is a pure function (one step per line, list markers stripped, blank lines and a none answer dropped, three at most), and it is the part a test covers.

## Files

All new, under `packages/genshin-mods`:

```text
src/waypoints/registerWaypoints.ts   the turn-end fork, the press and the clearing
src/waypoints/parseWaypoints.ts      the fork's answer into at most three steps
src/waypoints/parseWaypoints.test.ts
```

## Notes

- A fork per answered turn costs one cache read of the conversation plus a short answer. That is the price of the feature, and `/waypoints off` is the way to stop paying it.
- The engine already proposes a single next prompt after a turn, greyed in the input. Waypoints differs in offering a few at once and sending one on a press, and the two do not interfere: a press sends, and the engine's proposal only fills the box.
