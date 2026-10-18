# Live edits

## Why

An open resource editor is never told that another device saved, except the todo list's. When the same resource is saved from another device or tab, the editor's next save is refused as stale, and the notice asks for a refresh, which reloads the page and drops whatever the person typed since their last save. An agent editing a resource the owner has open would meet this on every write. So adoption is made generic for every type before agents write, and it helps two tabs as much as it helps an agent.

## What Changes

Every open resource adopts another device's save, and an unsaved edit is presented as a choice instead of being refreshed away.

- One save subscription serves every open resource type, so no type needs its own.
- An editor with no unwritten edit takes the new version in place, clears its undo history and its delta baseline, so the next large save is written whole.
- An editor with an unwritten edit is told at once that another device saved, naming the device. Autosave holds until the person answers.
- **BREAKING**: the stale-save notice that asked for a refresh is replaced by a choice between taking the other version and keeping the local edit.
- Taking theirs adopts the other version and drops the local edit. Keeping mine saves the local document over it, and the other write stays in version history.
- An agent is named in the notice by its key's name.
- The todo list re-reads another device's save in place of taking the streamed list.

## Capabilities

- **architecture/ai-native-resources/live-edits** (new)

## Waiting on

None.

## Impact

- The resource editor shell, which runs the open resource's save subscription for whatever type it is.
- The resource store, which adopts a save or asks, and owns the notice and its two answers.
- The sheet's undo history, which clears on adoption.
- The save stream, which carries the version and the writing device rather than the content.
- The todo list, which loses its own streamed-list adoption and its own subscription.
