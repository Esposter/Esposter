# Leave role count

## Why

The member list's role groups are counted from the server for each member the role groups were read for, and the roleless group is derived as the total less the groups. A member outside the loaded pages leaves without their role group ever having been read, so the leave drops the total but no group. In a room where everyone holds a role the roleless remainder then goes negative, which [room-ui](../../specs/esbabbler/room-ui/design.md) says the leave path prevents.

## What Changes

A member's departure leaves every role group count equal to the members holding that role, whether or not the member's roles were loaded.

## Capabilities

- **esbabbler/room-ui** (modified)

## Impact

- The member store's leave path and the role groups' counts in the member list.
