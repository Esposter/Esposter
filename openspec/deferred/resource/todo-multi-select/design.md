# Todo multi-select

A selection mode on a TodoList that picks several todos at once, by shift-click or tick, for one bulk delete, as Microsoft To Do selects tasks and deletes them together ([Create, edit, delete, and restore tasks](https://support.microsoft.com/en-us/ToDo/create-edit-delete-and-restore-tasks)).

## Why deferred

The case a bulk delete serves, clearing what is finished, is **Delete completed**, which is confirmed and already built ([completion](../../../specs/resource/todolist-completion/design.md)). A selection mode is a second way to hold a row, beside the row that opens its dialog and the context menu, and it earns its place only with more than one command to run on the selection. Delete is the one command left that it would serve alone.

## Revisit when

[Moving todos between lists](../todo-move-between-lists/design.md) is built, since that is a second command on a selection, so one selection mode serves both. Or an owner asks to delete open todos in a group and Delete completed does not reach them.
