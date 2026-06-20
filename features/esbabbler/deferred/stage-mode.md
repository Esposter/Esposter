# Stage Mode

A room setting where only users with `SpeakInStage` or `MuteMembers` publish microphone/camera by default — a town-hall / presentation call layout.

## Why deferred

- Stage/town-hall is a large-event feature; overkill for casual drop-in room calls.
- Adds a new `RoomPermission.SpeakInStage` bit and call-publishing gating for a use case that has not come up.

## Revisit when

Rooms host large, presentation-style calls where most participants should be listeners by default. If it ships, add `RoomPermission.SpeakInStage` in the same permission-bitfield migration as `ManageEvents` (see [../specs/community-events.md](../specs/community-events.md)) so the bitfield is migrated only once.
