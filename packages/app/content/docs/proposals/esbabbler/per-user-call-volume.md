---
title: Per-user call volume
description: Proposal — per-remote-participant volume slider in the active call.
---

# Per-User Call Volume

Right-click (or overflow menu) on a call participant → **User Volume** slider (0–200%) adjusting only that participant's audio locally — Discord's per-user volume.

## Scope

**Today:** one master speaker volume (`speakerVolumePercentage`, applied as `HTMLMediaElement.volume` to every remote audio element — see [/docs/esbabbler/voice-video](/docs/esbabbler/voice-video)).

**This adds:** a per-remote-participant multiplier on top. **Client-only, in-call state** — Discord has no stored panel default for this either, so there is no DB column and no procedure; state lives in `call/media.ts` and dies with the call.

## How it works

- `call/media.ts` gains `participantVolumeMap: Map<participantId, number>` (participantId = LiveKit identity = auth session id).
- Effective element volume = `min(1, (speakerVolumePercentage / 100) × (participantVolume / 100))` — LiveKit's `RemoteParticipant.setVolume()` handles >100% boost via WebAudio when available; otherwise cap at 100%.
- UI: participant tile action menu (where moderation items already live) gains a **User Volume** slider; resets to 100% when the participant leaves.

## Key files

| File                                                                    | Change                            |
| :---------------------------------------------------------------------- | :-------------------------------- |
| `packages/app/app/store/message/room/call/media.ts`                     | `participantVolumeMap`            |
| `packages/app/app/store/message/room/liveKit.ts`                        | apply via `participant.setVolume` |
| `packages/app/app/components/Message/Content/Call/Participant/Tile.vue` | action-menu slider                |

## Notes

No persistence, no server involvement — deliberately the smallest possible feature. If users later ask for remembered per-friend volumes, that becomes a `userSettingsInMessage`-adjacent design decision, not an extension of this.
