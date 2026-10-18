# Todo Move Between Lists

Microsoft To Do selects one task or several and, from the context menu, **Move tasks to** another list ([Move tasks between or within lists](https://support.microsoft.com/en-us/office/move-tasks-between-or-within-lists-8360617e-63c6-4bf7-952a-60af4b920b62)).

## Why deferred

A TodoList is a resource of its own ([resources](../../../specs/architecture/resource/design.md)), its content versioned and saved apart from every other list. A move is two saves that must both land — the todo added to one list and taken from the other — across two version checks, where every write today touches one resource. It is the same cross-resource step the [smart lists](../todo-smart-lists/design.md) wait on, and within one list [manual order](../../../specs/resource/todolist-manual-order/design.md) already moves a todo where it belongs.

## Revisit when

A reader keeps several TodoLists and asks to move todos between them, or the smart lists ship a cross-resource read — whichever comes first, the move rides it.
