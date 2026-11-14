# Calls

Discord-style persistent per-room drop-in audio/video plus standalone share-link calls (like Google Meet). Room members join/leave room calls freely; `/calls` starts a roomless call joinable by anyone with the link. Media runs through **Cloudflare RealtimeKit** — the server adds each device to the call's meeting as a participant and returns its auth token, and the call's `CallObject` keeps the participant map for observers; RealtimeKit handles all WebRTC signaling, track publication, simulcast, and bandwidth estimation.

Sub-pages: [call view UI](call-view/design.md) · [screenshare](screenshare/design.md) · [picture-in-picture](picture-in-picture/design.md) · [per-user volume](per-user-volume/design.md) · [virtual backgrounds](virtual-backgrounds/design.md) · [blocked call audio](blocked-audio/design.md). Voice preferences applied to calls: [voice & video settings](../voice-video/design.md).

## The session model

A call is anchored to a `callSessionsInMessage` row, not a route:

- `id: text` PK — a **shareable alphanumeric token** (`createId(CALL_ID_LENGTH)`, crypto-secure); the id _is_ the shareable link token.
- `roomId` — set for room calls (unique FK → rooms, cascade); null-scoped standalone calls persist ownership on `userId` (creator).
- The session row is the persistent 1:1 anchor per room and survives restarts, and so do the participants: the call's own `CallObject` keeps them in its storage, so an eviction of the object loses nothing.

`CallParticipant.id` is the **auth `session.id`, not `user.id`** — the custom participant id RealtimeKit is given is `session.id`, so each device is its own participant (separate tracks, separate mute state). Using `user.id` would make multi-device join last-write-wins and let device A's leave evict device B.

## The call lifetime boundary

**Call membership is anchored to `activeCallSessionId`, never the viewed route.** `activeCallSessionId` answers "what call am I in?"; `currentRoomCallSessionId` answers "what call belongs to the room I'm looking at?" — they can differ, and that is valid. Navigating rooms swaps the observer only.

Leave happens only on: explicit **Leave Call**, moderation (`KickFromCall`/`KickFromRoom`/`TimeoutUser`/`CreateBan`/`SoftBan` on the call's room), real session loss (logout, tab close, RealtimeKit `meeting.participantLeft` webhook), or `/calls/[id]` unmount (that page _is_ the call context — except when popped out to [picture-in-picture](picture-in-picture/design.md)). A moderation that narrows a participant's publishing is not a leave: the participant's connection is replaced and its user rejoins the meeting with a new token, and the participant stays in the call.

| Owner                               | Responsibility                                                                                                                                           | Must not do                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `callStore.leaveCall()`             | the only normal path that leaves, leaves the RealtimeKit meeting, and resets active state                                                                | run implicitly during room navigation                   |
| `useCallSubscribables()`            | observes the viewed room's session; updates `currentRoomCallSessionId`, and its participants unless the joined call holds that session                   | remove the active participant or disconnect RealtimeKit |
| `useCallParticipantSubscribables()` | subscribes the joined call's participants, from the messages layout for a room call and the call page for a standalone one; a session has one such owner | subscribe a session the joined call does not hold       |
| `useCallIdSubscribables()`          | owns `/calls/[id]` membership; validates session, subscribes, leaves on unmount (unless popped out)                                                      | reuse room-navigation cleanup semantics                 |
| `LeftSideBar/StatusBar.vue`         | surfaces **any** active call (room or standalone) and links back to it                                                                                   | decide membership from `currentRoomCallSessionId`       |

## Join flow

```mermaid
sequenceDiagram
    participant A as Client (joining)
    participant T as tRPC callSession router
    participant O as CallObject
    participant RTK as RealtimeKit
    participant B as Other clients

    A->>T: joinCallByRoomId({ roomId }) / joinCall({ id })
    T->>O: join the call for this session
    O->>RTK: add the participant with the join preset
    RTK-->>O: auth token and participant id
    O->>O: record the participant and its publish sources
    O-->>T: the joined call
    T-->>A: { authToken, meetingId }
    A->>RTK: join the meeting with authToken
    O->>B: join frame on the call socket
    RTK-->>T: webhook meeting.participantJoined (backup path)
    Note over A,B: audio/video/screenshare tracks flow through RealtimeKit
```

The RealtimeKit webhook (`server/api/webhooks/realtimekit.post.ts`, validated by `verifyRealtimeKitWebhook`) is the **backup** for clients that disconnect without calling `leaveCall` (tab crash, network drop) — never the primary path for in-app route changes. It is also the door a token cannot get around: a room call's `meeting.participantJoined` is checked against the room's membership and any timeout (`checkIsCallConnectionAdmitted`), and a connection the room no longer admits is disconnected rather than added, since a token already issued is not withdrawn by a removal.

### Standalone knock lobby

Every `/calls/[id]` visitor sees prejoin (verify mic/camera) first. The creator (persisted `callSessionsInMessage.userId`) gets **Join now**; non-creators get **Request to join** → `knockCall` puts them in the call object's knocker set, the creator admits (`admitKnocker` → a one-time admitted entry on the call object) or dismisses, and only then does `joinCall({ id })` succeed. Admitting, dismissing and the `knockCall` frame to the doorkeeper all pass one guard, `requireCallDoorkeeper`: the caller must be the creator, and must be in the call themselves — a creator who has left admits nobody.

```mermaid
flowchart TD
  VISIT["visitor opens the call link"] --> ISCREATOR{"session creator?"}
  ISCREATOR -- yes --> JOIN["joinCall — RealtimeKit auth token"]
  ISCREATOR -- no --> KNOCK["knockCall — a knocker entry on the call object"]
  KNOCK --> NOTIFY["knockCall frame to the creator's sockets — the lobby list"]
  NOTIFY --> DECIDE{"creator decides"}
  DECIDE -- admit --> ADMITTED["admitKnocker — one-time admitted entry"]
  DECIDE -- dismiss --> DISMISSED["dismissKnocker — dropped from the knocker set"]
  ADMITTED --> JOIN
  DISMISSED --> WAIT["stays on prejoin"]
```

The creator's lobby list is optimistic: admitting or dismissing removes that knocker at once, and each knocker is its own write target so a host can work down the queue without the writes queueing. A rejected one therefore puts back **only** its own knocker — reinstating the list as it stood would resurrect one already admitted beside it and drop whoever the `knockCall` frame delivered meanwhile.

## Live call state

Everything about a live call except its anchor row lives in its `CallObject`'s storage, keyed by the call session. The storage holds four things, kept apart because they end at different times:

- The participant map — the joined connections, keyed by auth session id. Created by a join and deleted by a leave; a call is live while it has an entry. `requireJoinedCallSession` reads it for everyone but the call's creator, who is admitted from the stored session row.
- The knocker and admitted sets — the standalone waiting room. They are cleared with the participant map, because a call nobody is in has nobody left to admit anyone.
- The call's start time — set by the first joiner and read by the last leaver, after the participants are already gone, to word the call-duration system message. It outlives the teardown on purpose, which is exactly why it cannot be a field of a record deleted as a unit.
- The RealtimeKit participant map and each participant's publish sources, which a moderation's kick and rejoin reads.

The storage outlives the object going idle and the web Worker redeploying, so a call's state does not depend on any one isolate or process staying up. RealtimeKit holds the media, and the object holds this side's picture of it.

```mermaid
flowchart TD
  JOIN["first join — the object's joinCall"] --> CREATE["participant entry plus the call's start time"]
  CREATE --> KNOCK["knockCall and admitKnocker fill the knocker and admitted sets"]
  CREATE --> LEAVE["a leave — leaveCall, or participantLeft from the webhook"]
  KNOCK --> LEAVE
  LEAVE --> LAST{"was that the last participant?"}
  LAST -->|"no"| KEEP["every entry stays — the call is still live"]
  LAST -->|"yes"| TEARDOWN["participants, knockers and admitted cleared together — knockerDismissed pushed to each"]
  TEARDOWN --> DURATION["start time read for the duration, then cleared"]
  DURATION --> SUMMARY["MessageType.Call system message carrying the duration"]
```

Every teardown path funnels through the call object's leave — `leaveCall` for the explicit leave, `participantLeft` for the RealtimeKit `meeting.participantLeft` webhook, and `evictUser` for the moderation actions — so the start time is never orphaned by a call that ended some other way.

## Procedures

All in `server/trpc/routers/call/index.ts`, registered as `callSession`; the waiting-room procedures live in `server/trpc/routers/call/knocker.ts` and merge in under a `knocker` key:

| Procedure                                                                                                                         | Auth               | Purpose                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| `createCall`                                                                                                                      | authed             | create a standalone roomless session (`/calls`)                                      |
| `readCallSessionId({ roomId })`                                                                                                   | member             | room observer entry; returns `""` if none (never null)                               |
| `readCallSession({ id })`                                                                                                         | authed             | standalone validation for `/calls/[id]`                                              |
| `joinCallByRoomId({ roomId })`                                                                                                    | member             | create/reuse room session; returns the RealtimeKit auth token                        |
| `joinCall({ id })`                                                                                                                | authed             | standalone join — creator or admitted knocker only                                   |
| `leaveCall({ callSessionId })`                                                                                                    | authed             | remove from participant map; last leaver posts the `MessageType.Call` system message |
| `readCallParticipantMap({ callSessionId })`                                                                                       | authed             | initial participant map for observers                                                |
| `setMuted` / `setCameraEnabled`                                                                                                   | authed             | sync state to the server map; broadcast                                              |
| `setHandRaised`                                                                                                                   | authed / moderator | raise own hand; lowering another's needs `MuteMembers` on the call's room            |
| `knocker.knockCall` / `knocker.admitKnocker` / `knocker.dismissKnocker`                                                           | authed / creator   | standalone waiting room — admitting and dismissing need the creator, in the call     |
| the call socket `/ws/call/:callSessionId`, frames `joinCall` / `leaveCall` / `muteChanged` / `videoChanged` / `handRaisedChanged` | joined or knocking | the object broadcasts each frame to the call's sockets                               |
| frames `knockCall` (creator's sockets), `knockerAdmitted` / `knockerDismissed` (the knocker's own session)                        | creator / knocker  | the call socket                                                                      |

A call's events reach a socket only while its session is joined or knocking on the call: the call object refuses any other socket when it opens, and a leave closes that session's sockets. In a room, a member removed from the room leaves the call the same way a kick or a ban does, through `evictUser`. A standalone call ends for a participant when its own session leaves, by `leaveCall` or by the RealtimeKit webhook that reports the disconnect.

Each participant joins the call's meeting with the preset that names its publish sources. A join starts with the microphone and screen share; camera is never moderated, so every preset allows it. The four presets — camera alone, and camera with the microphone, the screen share or both — are created once per environment by the provisioning step, since the Pulumi provider declares none of them.

## Client stores

`store/message/room/call/index.ts` is the orchestration root (session boundaries, tRPC + SDK coordination); focused state lives in smaller stores so the realtime bridge never imports the root:

| Store                 | Owns                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `call/index.ts`       | `activeCallSessionId`, `currentRoomCallSessionId`, `callRoomId` (admin-action room checks)                                                    |
| `call/participant.ts` | `callSessionParticipantsMap` (keyed by session id), `speakingIds`, join notice                                                                |
| `call/media.ts`       | deafen, force-mute, camera, screenshare + pin state, virtual background, `isPoppedOut`, streams, [per-user volume](per-user-volume/design.md) |
| `call/knocker.ts`     | `knockingCallSessionId`, pre-join options, knocker queue                                                                                      |
| `realtime.ts`         | the RealtimeKit meeting bridge: connect, track events, device switching, mic processor, [blocked audio](blocked-audio/design.md)              |

DM calls work identically — call procedures accept `RoomType.DirectMessage`; membership via `usersToRooms` gates access. The first joiner posts the `MessageType.Call` "started a call" system message, and call end writes the call-duration variant.

## Key files

| File                                                             | Role                                                           |
| :--------------------------------------------------------------- | :------------------------------------------------------------- |
| `packages/db-schema/src/schema/message/callSessionsInMessage.ts` | session anchor table                                           |
| `apps/web/server/trpc/routers/call/index.ts`                     | all call procedures (registered as `callSession`)              |
| `apps/web/server/trpc/routers/call/knocker.ts`                   | waiting-room procedures (merged under `knocker`)               |
| `apps/web/server/services/message/call/`                         | guards, the call object accessor and the summary writer        |
| `apps/functions/src/durableObjects/CallObject.ts`                | the call's state, its sockets and its RealtimeKit participants |
| `apps/web/server/api/webhooks/realtimekit.post.ts`               | webhook backup for join/leave                                  |
| `apps/web/app/store/message/room/call/`                          | root + participant + media + knocker stores                    |
| `apps/web/app/store/message/room/realtime.ts`                    | RealtimeKit meeting bridge                                     |
| `apps/web/app/pages/calls/`                                      | standalone lobby (`index.vue`) + call route (`[id].vue`)       |

## Notes

- **An SFU rather than a mesh.** Mesh WebRTC costs each participant an upload per peer, which video and screenshare make unsustainable past a handful of people.
- **No media server of ours.** RealtimeKit runs the SFU, TURN and signalling, so no process of ours routes UDP and no call needs a server to scale. The trade is the cost: RealtimeKit bills per participant-minute beyond the paid plan's included allowance, so a call's cost follows its usage rather than a fixed server.
