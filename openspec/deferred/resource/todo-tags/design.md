# Todo Tags

Microsoft To Do adds "steps, importance, notes, tags, and categories" to a task ([Managing tasks](https://support.microsoft.com/en-us/office/managing-tasks-in-microsoft-to-do-e7293389-f29d-44b4-ba9b-077025c9acd3)), and a tag gathers every task carrying it into one view.

## Why deferred

A tag earns its place by gathering: "everything tagged #errand, from every list". That is a view across every TodoList — the [smart lists](../todo-smart-lists/design.md)' cross-resource read. Inside one list, the [importance](../../../specs/resource/todolist-importance/design.md) star, the sort and the search already find what a tag would. The resource itself is already tagged ([tags](../../../specs/resource/tags/design.md)), which is what the explorer gathers by.

## Revisit when

The smart lists ship a cross-resource read of todos, so a tag has somewhere to gather into.
