import { DIALOG_CLOSE_DURATION_MS } from "@/services/ui/constants";

const checkIsPresent = (value: unknown) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

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
// Showed — an optimistic delete — rises out with it rather than vanishing under `v-if="item"`.
// The reconciling runs from the first read, so a target already set when the lookup mounts over a list without its
// Item is dropped too, and the lookup's owner clears the target when it unmounts: the target lives in a store that
// Outlives the page, so a dialog left open by a navigation would otherwise re-open over its row on the way back.
// A dialog over a set of rows — a selection's delete — targets their ids and resolves the rows still present, and an
// Empty set is no target and no item, so the same reconciling drops a selection whose rows are all gone
export const useSingletonDialog = <TTarget extends string | string[], TItem>(
  target: Ref<TTarget>,
  item?: MaybeRefOrGetter<TItem | undefined>,
) => {
  const clearTarget = () => {
    target.value = (Array.isArray(target.value) ? [] : "") as TTarget;
  };
  const targetItem = computed(() => (item === undefined ? undefined : toValue(item)));
  const leavingItem = shallowRef<TItem>();
  const { start: startLeave } = useTimeoutFn(
    () => {
      leavingItem.value = undefined;
    },
    DIALOG_CLOSE_DURATION_MS,
    { immediate: false },
  );
  if (item !== undefined) {
    watchImmediate(targetItem, (newTargetItem, oldTargetItem) => {
      // An empty set resolves to a fresh array on every read, so one empty item following another is no change
      if (checkIsPresent(newTargetItem) || (oldTargetItem !== undefined && !checkIsPresent(oldTargetItem))) return;
      leavingItem.value = oldTargetItem;
      startLeave();
      clearTarget();
    });
    onScopeDispose(clearTarget);
  }
  return {
    isOpen: computed({
      get: () => checkIsPresent(target.value),
      set: (value) => {
        if (value) return;
        clearTarget();
      },
    }),
    item: computed(() => (checkIsPresent(targetItem.value) ? targetItem.value : leavingItem.value)),
  };
};
