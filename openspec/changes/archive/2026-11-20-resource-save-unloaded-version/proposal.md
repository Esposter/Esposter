# Unloaded save carries its own confirmed version

A content save of a resource the blade has moved off sends the version it was issued at, so a newer version from another device is never overwritten by a save built on an older one.

## Why

A content save queued behind an in-flight save of a resource reads its version when it is sent. For the loaded resource that is the version its content was read or saved at. For a resource no longer open the store sends the held row's `contentVersion` instead, and a Recent read can have moved that row to a version another device wrote. The server then accepts a save whose content was built on the older version, and the other device's content is overwritten with no stale notice. The stale-version guard exists to stop exactly this, and the unloaded branch skips it.

## What changes

- A save of an unloaded resource sends the version its own content was confirmed at, held by the store per resource for as long as the save queues, not the held row's current version.
- A row read or an event that moves the held row's version does not move that confirmed version, so the stale check still refuses the save.

## Capabilities whose behaviour changes

- `resource/resource-save-state`: a save of a resource that is no longer open is refused as stale when another device moved its content on, and the owner sees the stale notice.

**Not BREAKING.** The wire shape of `saveResourceContent` is unchanged; only the version a save of an unloaded resource carries.

## Out of scope

Keeping the confirmed version across page reloads, and any change to how a loaded resource's version is read.
