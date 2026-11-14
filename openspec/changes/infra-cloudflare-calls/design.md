# Cloudflare calls

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). Calls move from a self-hosted LiveKit SFU to Cloudflare RealtimeKit; the call's session row, its knock and admit flow and its in-memory participant maps are unchanged.

## What maps to what

| LiveKit today                                                   | RealtimeKit                                                                                    |
| :-------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| a room per call session, created on first join                  | a meeting per call session, created by the REST API and its id stored on the session row       |
| `createLiveKitToken` with grants                                | add participant to the meeting with a preset, returning its auth token                         |
| `updateLiveKitTrackSources` (who may publish which source)      | the participant's preset, switched by the REST API                                             |
| `removeLiveKitParticipant` on kick, ban and eviction            | the REST API's participant removal                                                             |
| webhook `participant_joined` / `participant_left`               | webhook `meeting.participantJoined` / `meeting.participantLeft`, verified by its RSA signature |
| `livekit-client` `Room`, tracks and events in `useLiveKitStore` | `@cloudflare/realtimekit`'s meeting object in a `useRealtimeStore`                             |
| `MicrophoneProcessor` as a LiveKit `TrackProcessor`             | the same Web Audio graph as an audio middleware on the local track                             |
| `@livekit/track-processors` virtual backgrounds                 | `@cloudflare/realtimekit-virtual-background`                                                   |
| active speakers, connection quality                             | the meeting's active-speaker and network-quality events                                        |

The user-facing call — devices, push-to-talk, per-user volume, screenshare, picture-in-picture, hand raise, camera and mute state — keeps its stores and components; only `useLiveKitStore` and the services under `app/services/message/room/liveKit` change underneath them.

## The open check

RealtimeKit's documentation confirms the participant webhooks and client-side kick, but not a server-side participant removal or a server-side preset change, and its last explicit status was a closed beta. The first task reads the REST reference for both; if either is missing, the moderation actions would lose their server enforcement, so the part stops and reports instead of shipping that.

## Key files

| File                                                            | Role after the change                          |
| :-------------------------------------------------------------- | :--------------------------------------------- |
| `apps/web/server/services/livekit/createLiveKitToken.ts`        | replaced by the participant add                |
| `apps/web/server/services/livekit/updateLiveKitTrackSources.ts` | replaced by the preset switch                  |
| `apps/web/server/services/livekit/removeLiveKitParticipant.ts`  | replaced by the participant removal            |
| `apps/web/server/api/webhooks/livekit.post.ts`                  | replaced by the RealtimeKit webhook route      |
| `apps/web/server/services/message/call/joinLiveKitCall.ts`      | joins the meeting                              |
| `apps/web/app/store/message/room/liveKit.ts`                    | replaced by the RealtimeKit store              |
| `apps/web/app/models/message/room/call/MicrophoneProcessor.ts`  | an audio middleware                            |
| `apps/web/shared/models/environment/WebEnvironmentVariables.ts` | RealtimeKit's app id and key replace LiveKit's |
| `livekit-server/Dockerfile`                                     | deleted                                        |
| `livekit-monitor/Dockerfile`                                    | deleted                                        |
