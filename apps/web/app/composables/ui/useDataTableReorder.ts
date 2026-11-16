import { REORDER_HANDLE_CLASS } from "#src/services/ui/constants";

// The reorder half of a table whose rows can be put in another order: a drag by the rows' handle, and Alt+Up and
// Alt+Down on the focused row, each handing the page's new order to the call site as ids
export const useDataTableReorder = <T extends { id: string }>(
  isReorderActive: () => boolean | undefined,
  pageIds: ComputedRef<T["id"][]>,
  onReorder: (ids: T["id"][]) => void,
) => {
  const { announce, announcement, getKeyedOrder } = useReorder();
  const getDragReorderProps = useDragReorder();
  // What the one body takes while it drags: the page's rows by their handle, and their new order handed back as ids
  const reorderProps = computed(() => getDragReorderProps(pageIds.value, onReorder, `.${REORDER_HANDLE_CLASS}`));
  // The page's rows in their new order; a key's move is read out, and the focus the moved row held is put back, since
  // Re-rendered in its new place the row is a moved element that lost it on the way
  const onReorderKeydown = async (event: KeyboardEvent) => {
    if (!isReorderActive() || !(event.target instanceof HTMLElement)) return;
    const id = event.target.closest<HTMLElement>("[data-reorder-id]")?.dataset.reorderId;
    if (id === undefined) return;
    const keyedOrder = getKeyedOrder(event, pageIds.value, pageIds.value.indexOf(id));
    if (!keyedOrder) return;
    event.preventDefault();
    onReorder(keyedOrder);
    announce(keyedOrder, id);
    const focusedElement = event.target;
    await nextTick();
    focusedElement.focus();
  };
  return { announcement, onReorderKeydown, reorderProps };
};
