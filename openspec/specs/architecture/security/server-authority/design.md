# Server Authority

A client is code the attacker runs. Whatever it is trusted to do on its own behalf — obey a moderator, name itself, say what kind of message it is posting, report where it connects from — is a thing a hostile client simply does differently. So each of those is decided on the server, and the client's own behaviour is kept only as the courtesy that makes the honest path feel instant.

## How it works

```mermaid
flowchart LR
  actor["a moderator or a member"] --> server["procedure"]
  server -->|"decides and applies"| state["rows, the SFU, the room's lines"]
  server -->|"emits"| event["subscription event"]
  event -.->|"courtesy"| target["targeted client"]
  target -.->|"ignores it"| state
```

The dotted edges are the ones a hostile client controls, and nothing downstream depends on them: the state was already changed before the event left.

## Where it applies

- **Moderation of a call.** A kick, a ban, a soft ban or a timeout takes the member out of every call the room runs, and force mute and stop screen share revoke the member's publishing at RealtimeKit. A removed member's token stays valid at RealtimeKit until its expiry, so every participant-joined webhook re-checks the room's door and drops a connection the room no longer admits ([moderation](../../../esbabbler/moderation/design.md)).
- **The room's own voice.** A join, a leave, a call, a pin and a rename are lines the server writes; a member posts only messages and polls ([messaging](../../../esbabbler/messaging/design.md)). A line in the room's voice carries member names verbatim, so it is rendered as text wherever a message is rendered as markup.
- **Who a member is.** The typing indicator reads the member's name off their membership row rather than the input, so no member can type as someone else.
- **Where a caller connects from.** An anonymous caller is keyed on the address the platform's front end appended, never an entry the caller sent ([rate limiting](../../rate-limiting/design.md)).
- **A third party's allowance.** A value a third party knows at build time is baked into the build rather than read from it per request. The build version is the commit count the web build writes into its public runtime config; a runtime read of GitHub's API is rejected, since a Worker's fetch carries no User-Agent, GitHub refuses it, and the unauthenticated allowance is shared by everyone on the Worker's egress address.

## Key files

Paths relative to `apps/web`; `packages/` and `apps/realtime/` ones to the repo root.

| File                                                                     | Role                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------- |
| `server/services/message/moderation/evictRoomCallParticipants.ts`        | a removal reaching every call in the room       |
| `server/services/message/call/checkIsCallConnectionAdmitted.ts`          | the door every call connection is asked again   |
| `apps/realtime/src/services/realtimeKit/removeRealtimeKitParticipant.ts` | a participant the server removes at RealtimeKit |
| `packages/db-schema/src/models/message/UserMessageType.ts`               | the message types a member may post             |
| `server/services/request/getIpAddress.ts`                                | the anonymous caller's address                  |
| `configuration/runtimeConfig.ts`                                         | the build version baked at build time           |
