---
title: Todo move between lists
description: Deferred — moving todos from one TodoList to another, as To Do's Move tasks to is; it is a write to two resources' content at once, the cross-resource work the smart lists wait on.
---

# Todo Move Between Lists

Microsoft To Do selects one task or several and, from the context menu, **Move tasks to** another list ([Move tasks between or within lists](https://support.microsoft.com/en-us/office/move-tasks-between-or-within-lists-8360617e-63c6-4bf7-952a-60af4b920b62)).

## Why deferred

Each TodoList is its own resource with its own content ([resources](/docs/architecture/resource)), versioned and saved on its own. A move is two saves that must both land — the todo added to one list and taken from the other — across two version checks, where every write today touches one resource. It is the same cross-resource step the [smart lists](/docs/resource/deferred/todo-smart-lists) wait on, and within one list [manual order](/docs/resource/todolist-manual-order) already moves a todo where it belongs.

## Revisit when

A reader keeps several TodoLists and asks to move todos between them, or the smart lists ship a cross-resource read — whichever comes first, the move rides it.
