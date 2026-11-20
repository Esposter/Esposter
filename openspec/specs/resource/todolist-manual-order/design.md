# TodoList Manual Order

Built on [completion](../todolist-completion/design.md) and [importance](../todolist-importance/design.md). The list's order is already content — `items` is an ordered array, so a reorder is saved with the list — and the owner changes it here.

## How it works

- **The rows are a reorderable `UiList`.** The open group passes `isReorderable` while the sort is _My order_; the reordering itself is the UI library's, so every list reorders the same way ([UI library](../../architecture/ui-library/design.md)). The whole row drags, lifted over the rest of the list, which moves aside to open the place it will land in. On touch it waits a moment first, so a swipe still scrolls and a longer rest still opens the row's context menu.
- **The keyboard moves a row too**, since a drag is never the only way to do a thing: with a row focused, **Alt+Up** and **Alt+Down** move it one place, and focus stays on it; how the move is announced is the UI library's.
- **A move writes through the store's `reorderItems`**, which gives each moved todo the next of the places those todos held (`getReorderedItems`), so a todo a search hides, or one under Completed, keeps its place in the array. A refused save keeps the new order on screen with the save state reading Not saved, since a content write has no rollback; a save from another device adopted before this one settled is the order that stands.
- **Only _My order_ drags.** Another sort shows the rows in its own order and turns reordering off, so a drop never lands in an order the reader is not looking at.
- **Completed rows do not drag**; their order is when they were completed.

No field is added: the array is the order.

## Key files

| File                                                  | Role                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/web/app/components/Ui/List/Index.vue`           | The reorderable list: a drag within a group, the keyed move and its read-out |
| `apps/web/app/composables/ui/useDragReorder.ts`       | The drag itself ([Drag reorder](../../architecture/drag-reorder/design.md))  |
| `apps/web/app/composables/ui/useReorder.ts`           | Alt+Up and Alt+Down, and the live region's words                             |
| `apps/web/app/services/shared/getReorderedItems.ts`   | Moved rows placed into the places they held                                  |
| `apps/web/app/store/resource/todoList/index.ts`       | `reorderItems`, kept on a refused save                                       |
| `apps/web/app/components/Resource/TodoList/Items.vue` | Reordering on for the open group while the sort is My order                  |

## Sources

- [WAI-ARIA Authoring Practices — rearrangeable listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/) — Alt+Up and Alt+Down moving an option one place, with focus staying on the moved option.
