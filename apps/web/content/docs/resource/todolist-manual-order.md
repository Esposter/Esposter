---
title: TodoList manual order
description: Open todos are put in the reader's own order by dragging a row or by Alt+Up and Alt+Down, through the UI library's reorderable list, and the order is the items array the content already stores.
---

# TodoList Manual Order

Part of [TodoList to a todo product](/docs/proposals/resource/todo-list), built on [completion](/docs/resource/todolist-completion) and [importance](/docs/resource/todolist-importance). The list's order was already content — `items` is an ordered array, and a refused delete puts its row back at its index for that reason — but nothing could change it.

## How it works

- **The rows are a reorderable `UiList`.** The open group passes `isReorderable` while the sort is _My order_; the reordering itself is the UI library's, so every list reorders the same way ([UI library](/docs/architecture/ui-library)). The whole row drags, the rest of the list moves aside for it as it goes, and a line in the accent marks where it lands. On touch it waits a moment first, so a swipe still scrolls and a longer rest still opens the row's context menu.
- **The keyboard moves a row too**, since a drag is never the only way to do a thing: with a row focused, **Alt+Up** and **Alt+Down** move it one place, and focus stays on it; how the move is announced is the UI library's.
- **A move writes through the store's `reorderItems`**, which gives each moved todo the next of the places those todos held (`getReorderedItems`), so a todo a search hides, or one under Completed, keeps its place in the array. A refused save puts them back in the order they had, over whatever the list holds by then.
- **Only _My order_ drags.** Another sort shows the rows in its own order and turns reordering off, so a drop never lands in an order the reader is not looking at.
- **Completed rows do not drag**; their order is when they were completed.

No field is added: the array is the order.

## Key files

| File                                                  | Role                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/web/app/components/Ui/List/Index.vue`           | The reorderable list: a drag within a group, the keyed move and its read-out |
| `apps/web/app/composables/ui/useReorder.ts`           | Alt+Up and Alt+Down, and the live region's words                             |
| `apps/web/app/services/shared/getReorderedItems.ts`   | Moved rows placed into the places they held                                  |
| `apps/web/app/store/resource/todoList/index.ts`       | `reorderItems`, unwound on a refused save                                    |
| `apps/web/app/components/Resource/TodoList/Items.vue` | Reordering on for the open group while the sort is My order                  |

## Sources

- [WAI-ARIA Authoring Practices — rearrangeable listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/) — Alt+Up and Alt+Down moving an option one place, with focus staying on the moved option.
