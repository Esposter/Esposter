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

## Revoking a permission mid-call

RealtimeKit's REST API removes a participant from a meeting's active session and changes a participant's preset, but a preset change does not take a track that is already live off the air, and nothing in the API mutes one. So a revoke that narrows what a connection may publish is enforced by the SFU the only way it can be: the server kicks that connection, adds it back under the narrower preset, and hands the new auth token to its own user alone, as a `rejoin` on the call's existing `onJoinCall` subscription. The client rejoins with that token at once, keeping its devices and camera and the microphone only where the new preset allows it, so the participant sees a brief reconnect and the revoked source is gone. The kick reaches the client as a `kicked` leave, which is not the call ending, and the server flags the connection as rejoining while the kick is in flight, so the webhook's leave for that connection is not taken for its participant leaving. A grant only switches the preset. A kick or a ban by a moderator is a plain kick and sends no token. Rejected: changing the preset alone, which leaves the revoked track live until the participant toggles it themselves.

Open: the webhook names a participant by its custom id and a `peerId`, not by the participant id the REST calls return, so a participant leave that RealtimeKit reports after the flag clears cannot be matched to the connection it belongs to. Until its payload is confirmed to carry the connection id, that late leave still removes the participant from the call's map, which the next join webhook restores.

The four presets — camera alone, and camera with microphone, screen share or both — and the webhook subscription are created once per environment by the provisioning step, since the Pulumi provider declares neither.

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
