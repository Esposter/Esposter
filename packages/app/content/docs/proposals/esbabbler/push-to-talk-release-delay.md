---
title: Push-to-talk release delay
description: Proposal — configurable delay before the push-to-talk gate closes after key release.
---

# Push-to-Talk Release Delay

Discord's **Push-to-talk Release Delay** slider: after releasing the keybind, keep the mic gate open for a configurable grace period so word endings aren't clipped.

## Scope

**Today:** releasing the push-to-talk key closes the `MicrophoneProcessor` gain gate immediately ([/docs/esbabbler/voice-video](/docs/esbabbler/voice-video) → Push-to-talk).

**This adds:** a `pushToTalkReleaseDelayMs` user setting (integer, NOT NULL DEFAULT 0, CHECK 0–2000 — Discord's range) and a delayed gate close.

## How it works

- New `userSettingsInMessage.pushToTalkReleaseDelayMs` column (+ migration) surfaced as a slider under the Input Mode keybind, visible only in Push To Talk mode.
- `usePushToTalk` keyup/blur schedules the gate close with `setTimeout(…, pushToTalkReleaseDelayMs)` instead of closing immediately; pressing the key again cancels the pending close. Mode switches and call leave still close immediately (the reset path skips the delay).

## Key files

| File                                                                  | Change                             |
| :-------------------------------------------------------------------- | :--------------------------------- |
| `packages/db-schema/src/schema/userSettingsInMessage.ts`              | column + check constraint          |
| `packages/app/app/composables/message/room/call/usePushToTalk.ts`     | delayed close + cancel on re-press |
| `packages/app/app/components/Message/Model/User/Settings/Type/Voice/` | release delay slider               |

## Notes

Deliberately split from the shipped push-to-talk listener — the delay is a tuning knob on top of a gate that works without it.
