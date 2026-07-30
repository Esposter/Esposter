// Resolves a singleton dialog's item from its target ref, and drops the target when that item is gone.
// The two belong together: the dialog is mounted with `v-if="item"`, so a search, a page turn or an optimistic
// Removal takes the row out of the list and unmounts it mid-edit while the target ref stays set — and the dialog
// Then re-opens by itself, over that same row, the moment a later read brings it back.
// Called wherever the lookup lives, which is the component that owns the `v-if` — the dialog itself when it
// Resolves its own item, or the list when it passes the item down as a prop
export const useSingletonDialogTarget = <TItem>(target: Ref<string>, item: MaybeRefOrGetter<TItem | undefined>) => {
  const targetItem = computed(() => toValue(item));
  watch(targetItem, (newTargetItem) => {
    if (!newTargetItem) target.value = "";
  });
  return targetItem;
};
