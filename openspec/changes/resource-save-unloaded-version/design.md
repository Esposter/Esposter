# Design: unloaded save carries its own confirmed version

The save is `saveContent` in `apps/web/app/store/resource/index.ts`. Its `sent` pair takes `contentVersion` from `contentBaseVersion` when the resource is loaded (`checkIsLoaded(id)`), and from the held row's `target.contentVersion` otherwise. The loaded branch is right, since `contentBaseVersion` is set on every read and every confirmed save of the open resource. The unloaded branch is wrong: the held row can be read again from another device's save, so its version is newer than the content the save carries.

## The constraint the current code keeps

The version is read when the write is sent, not when it was issued, because a save queued behind another carries the version that one answered. The save ahead of it may have confirmed a new version of this resource. If the queued save sent the version it was issued at, the server would refuse our own save as stale. So the fix cannot be "send the issued version".

## Decision

Keep, per resource id, the version the store last confirmed for that resource's content. Set it on every content read and every confirmed content save, whether or not the resource is loaded. The `sent` pair then reads that map for every resource, and the held row's `contentVersion` is never used to build a save's version.

- The map is written where `contentBaseVersion` is written today (the read at the opening and `keepUnwrittenContent`), plus the confirmed-save branch, which currently writes it only when `checkIsLoaded(id)`.
- Rejected: the issued version. It refuses our own queued save after our own earlier save confirmed a new version.
- Rejected: reading the held row's version as the proxy for "latest". A row read from Recent is exactly the signal that another device has moved on, so it must not raise the version a save is built on.
- The map is cleared when the store holds no pending save for the id, so it does not grow across openings.

## Tests

- Regression, written first and seen failing: open resource R at version 3, issue a save, close R while it is in flight, deliver a row read at version 4, then send the queued save. It must carry version 3 (or the version the in-flight save confirmed), so the server's stale check refuses it.
- A queued save of a loaded resource is unchanged (existing `saveContent` tests).

## Ownership

The behaviour belongs to `openspec/specs/resource/resource-save-state/design.md`, which gets the spec delta when this ships.
