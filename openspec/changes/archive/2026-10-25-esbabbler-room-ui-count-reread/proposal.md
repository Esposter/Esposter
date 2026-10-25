# Count re-read policy

## Why

A leave or a role change whose prior top role was never read is settled by re-reading the room's group totals from the server (`room.readMemberCountsByTopRole`), as [room-ui](../../../specs/esbabbler/room-ui/design.md) describes. Three things about that re-read are open, and each needs a decision the code cannot make on its own:

- A failed re-read leaves the total already decremented while the role groups keep the leaver. The error only reaches `console.error`, and nothing retries or resets the counts, so the roleless remainder can go negative.
- A role event for a loaded member that the server committed before the re-read but that is delivered after it is counted twice until the next room switch. The [room-ui spec](../../../specs/esbabbler/room-ui/spec.md) SHALL that the counts stay exact, and the design records that they do not.

## What Changes

The re-read's failure policy and the snapshot race are decided, and the room-ui spec and design are brought into line with the decision. No behaviour changes until those decisions are made.

## Capabilities

- **esbabbler/room-ui** (modified)

## Impact

- The member store's count re-read in `apps/web/app/store/message/user/member.ts`, and the role-change hook that calls it.
- The room-ui spec's exact-counts requirement, or the server's event numbering if the race is closed rather than accepted.
