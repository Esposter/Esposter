# Content sync

## Why

Every resource type saves through the resource store, but the store tracked where the content stood with about ten separate flags and variables: the persisted serialization and hash, the confirmed versions, a held row, a held save, the stale latch, the failed flag, the unwritten-edit signal, the saves in flight and an adoption flag. Most combinations of them were states the content can never be in, and the conditions steering around those combinations kept missing one. A fast drag on the whiteboard reverted when a late row of the device's own save was read as another writer's, and an edit made while another device's save was being adopted was overwritten.

## What changes

- **One machine.** Where an opening's content stands is one value of a discriminated union, Unread, Synced, Dirty, Saving, Adopting, Conflict or Failed, so an impossible combination cannot be written down.
- **One pure reducer** takes each event (an edit, a save asked for, a save's answer or refusal, a row, a read, a choice in the notice) and returns the next state and the effects to run. The store only runs those effects.
- **The server's content version is the only clock.** A row at or below the version the opening confirmed is never another writer's.
- **One save at a time, the latest wins.** Saves asked for while one is in flight collapse into one follow-up carrying the latest content.
- **A stale refusal offers the choice.** A save refused because another writer moved the version on opens the same Take theirs or Keep mine notice as another device's save, rather than a refresh-only prompt.
- **An inductive transition check** applies every event to every state shape and holds each invariant across each step, so the invariants hold along every interleaving without one being explored.

## Capabilities

### New capabilities

- `architecture/content-sync`: the machine, its reducer and the invariants it holds.

### Modified capabilities

- `resource/resource-save-state`: Out of date lasts until the person chooses a version, not until a reload.

## Impact

The resource store's content section, autosave's edit signal and the notice keep their public names, except `unwrittenContentResourceId`, which becomes `markContentEdited`. No server, schema or procedure changes.
