import { DIALOG_CLOSE_DURATION_MS } from "@/services/ui/constants";

// The wiring for one singleton dialog, over the target ref that names its item (e.g. deletingId): the writable
// V-dialog model — open while the target is set, closing resets it to "" — and the resolved item, when the caller
// Passes one.
// Resolving and reconciling belong here rather than in the caller's own computed, because the dialog is mounted
// With `v-if="item"`: a search, a page turn or an optimistic removal takes the row out of the list and unmounts
// The dialog mid-edit while the target ref stays set, and the dialog then re-opens by itself, over that same row,
// The moment a later read brings it back. So a target whose item is gone is dropped with it.
// `item` is omitted by a dialog whose parent owns the lookup and hands the item down as a prop — there the parent
// Passes it and uses `item`, while the dialog itself passes nothing and uses `isOpen`.
// The item is held through the dialog's leave once its target goes, so a dialog closed by the removal of what it
// Showed — an optimistic delete — rises out with it rather than vanishing under `v-if="item"`
export const useSingletonDialog = <TItem>(target: Ref<string>, item?: MaybeRefOrGetter<TItem | undefined>) => {
  const targetItem = computed(() => (item === undefined ? undefined : toValue(item)));
  const leavingItem = shallowRef<TItem>();
  const { start: startLeave } = useTimeoutFn(
    () => {
      leavingItem.value = undefined;
    },
    DIALOG_CLOSE_DURATION_MS,
    { immediate: false },
  );
  if (item !== undefined)
    watch(targetItem, (newTargetItem, oldTargetItem) => {
      if (newTargetItem) return;
      leavingItem.value = oldTargetItem;
      startLeave();
      target.value = "";
    });
  return {
    isOpen: computed({
      get: () => Boolean(target.value),
      set: (value) => {
        if (value) return;
        target.value = "";
      },
    }),
    item: computed(() => targetItem.value ?? leavingItem.value),
  };
};
