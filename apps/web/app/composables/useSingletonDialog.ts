import { DIALOG_CLOSE_DURATION_MS } from "#src/services/ui/constants";

const checkIsPresent = (value: unknown) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

// The wiring for one singleton dialog, over the target ref that names its item (e.g. deletingId).
// It gives the writable V-dialog model: open while the target is set, and closing resets it to its empty value.
// It also gives the resolved item, when the caller passes one.
// Resolving and reconciling belong here, not in the caller's own computed, because the dialog is mounted with
// `v-if="item"`, so a search, a page turn or an optimistic removal takes the row out of the list.
// That unmounts the dialog mid-edit while the target ref stays set.
// Left alone, the dialog would re-open by itself over that same row once a later read brings it back.
// So a target whose item is gone is dropped with it.
// `item` is omitted by a dialog whose parent owns the lookup and hands the item down as a prop.
// There the parent passes it and uses `item`, while the dialog itself passes nothing and uses `isOpen`.
// The item is held through the dialog's leave once its target goes.
// So a dialog closed by the removal of what it showed, an optimistic delete, rises out with it.
// The dialog does not vanish under `v-if="item"`.
// The reconciling runs from the first read.
// So a target already set when the lookup mounts over a list without its item is dropped too.
// The lookup's owner clears the target when it unmounts.
// The target lives in a store that outlives the page.
// Left open by a navigation, the dialog would otherwise re-open over its row on the way back.
// A dialog over a set of rows, such as a selection's delete, targets their ids and resolves the rows still present.
// An empty set is no target and no item, so the same reconciling drops a selection whose rows are all gone.
export const useSingletonDialog = <TTarget extends number | string | string[], TItem>(
  target: Ref<TTarget>,
  item?: MaybeRefOrGetter<TItem | undefined>,
) => {
  // The empty value of the target's own kind
  const clearTarget = () => {
    // Each branch is the empty value of one kind TTarget can be, and the compiler cannot relate
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the union of the three to the generic TTarget
    target.value = (Array.isArray(target.value) ? [] : typeof target.value === "number" ? 0 : "") as TTarget;
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
