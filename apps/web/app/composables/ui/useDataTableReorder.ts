import { REORDER_HANDLE_CLASS } from "#src/services/ui/constants";

// The reorder half of a table whose rows can be put in another order: a drag by the rows' handle, and Alt+Up and
// Alt+Down on the focused row, each handing the page's new order to the call site as ids
export const useDataTableReorder = <T extends { id: string }>(
  checkIsReorderActive: () => boolean | undefined,
  pageIds: ComputedRef<T["id"][]>,
  onReorder: (ids: T["id"][]) => void,
) => {
  const { announcement, reorderByKey } = useReorder();
  const getDragReorderProps = useDragReorder();
  // What the one body takes while it drags: the page's rows by their handle, and their new order handed back as ids
  const reorderProps = computed(() => getDragReorderProps(pageIds.value, onReorder, `.${REORDER_HANDLE_CLASS}`));
  // The page's rows in their new order, with a key's move read out and the row's focus put back
  const onReorderKeydown = async (event: KeyboardEvent) => {
    if (!checkIsReorderActive() || !(event.target instanceof HTMLElement)) return;
    const id = event.target.closest<HTMLElement>("[data-reorder-id]")?.dataset.reorderId;
    if (id === undefined) return;
    const focusedElement = event.target;
    await reorderByKey(event, pageIds.value, id, onReorder, () => {
      focusedElement.focus();
    });
  };
  return { announcement, onReorderKeydown, reorderProps };
};
