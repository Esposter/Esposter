# Design: unloaded save carries its own confirmed version

The save is `saveContent` in `apps/web/app/store/resource/index.ts`. Its `sent` pair takes `contentVersion` from `contentBaseVersion` when the resource is loaded (`checkIsLoaded(id)`), and from the held row's `target.contentVersion` otherwise. The loaded branch is right, since `contentBaseVersion` is set on every read and every confirmed save of the open resource. The unloaded branch is wrong: the held row can be read again from another device's save, so its version is newer than the content the save carries.

## The constraint the current code keeps

The version is read when the write is sent, not when it was issued, because a save queued behind another carries the version that one answered. The save ahead of it may have confirmed a new version of this resource. If the queued save sent the version it was issued at, the server would refuse our own save as stale. So the fix cannot be "send the issued version".

## Decision

Keep, per resource id, the version the store last confirmed for that resource's content. Set it on every content read and every confirmed content save, whether or not the resource is loaded. The `sent` pair then reads that map for every resource, and the held row's `contentVersion` is never used to build a save's version.

- The map is written where `contentBaseVersion` is written today (the read at the opening and `keepUnwrittenContent`), plus the confirmed-save branch, which currently writes it only when `checkIsLoaded(id)`.
- Rejected: the issued version. It refuses our own queued save after our own earlier save confirmed a new version.
- Rejected: reading the held row's version as the proxy for "latest". A row read from Recent is exactly the signal that another device has moved on, so it must not raise the version a save is built on.
- The entry is held while its resource is loaded or a save of it is queued, and dropped once neither holds, so the map does not grow across openings. Dropping it on "no pending save" alone was the first draft and is wrong: a loaded resource between two saves has no pending save, so its next save would send no version.

## Tests

- Regression, written first and seen failing: two saves are queued on a resource read at version 0, the resource is closed, and another device's row at version 1 arrives before the queued save is sent. Before the fix both queued saves are sent at version 1; after it, at version 0, so the server's stale check refuses them. The two tests are the scenarios named in `tasks.md`.
- A queued save of a loaded resource is unchanged (existing `saveContent` tests).

## Ownership

The behaviour belongs to `openspec/specs/resource/resource-save-state/design.md`, which gets the spec delta when this ships.
