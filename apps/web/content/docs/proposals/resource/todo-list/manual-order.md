---
title: Manual order
description: Proposal — open tasks are reordered by dragging a row or by a keyboard move, and the order is the items array the content already stores.
model: claude-opus-5-5
---

# Manual Order

A sub-spec of [TodoList to a todo product](/docs/proposals/resource/todo-list), after [completion](/docs/proposals/resource/todo-list/completion).

## What it changes

The list's order is already content: `items` is an ordered array and `saveItem` puts a failed delete back at its index for that reason. What is missing is a way to change it. Open rows become draggable, and the drop moves the item within `items` and saves through the store's write path, unwinding to the old index on a failed save.

- **Pointer**: the whole row drags (a press-and-hold on touch, so a scroll is not a drag), with a drop line showing where it lands and the rest of the list opening a gap under the same FLIP move [completion](/docs/proposals/resource/todo-list/completion) uses.
- **Keyboard**: with a row focused, **Alt+↑ / Alt+↓** moves it one place, and the move is announced through a live region ("Moved to position 3 of 8"), since a drag is never the only way to do a thing.
- Dragging is only on while the sort is _My order_ ([importance](/docs/proposals/resource/todo-list/importance)); another sort shows the rows in its own order and disables the handle, so a drop never lands in an order the reader is not looking at.
- Completed rows do not drag; their order is their completion time.

No field is added and no drag-and-drop dependency is admitted: the rows are a short vertical list, and the platform's pointer events plus a FLIP move cover it. If an implementation finds otherwise, the dependency is argued through [dependency admission](/docs/architecture/dependency-admission).

## Key files

| File                                                  | Role after the change                                 |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `apps/web/app/components/Resource/TodoList/Items.vue` | draggable open rows and the keyboard move             |
| `apps/web/app/store/resource/todoList/index.ts`       | a move through the one write path, unwound on failure |

## Sources

- [WAI-ARIA Authoring Practices — listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) — the rearrangeable-list keyboard contract a keyboard move follows.
