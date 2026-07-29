// Writable v-dialog model over a singleton dialog target ref (e.g. deletingId):
// Open while the target is set, closing resets the target back to "".
// `getItem` is the resolved item the singleton guards its own rendering with, and passing it is what keeps the
// Two from disagreeing: the dialog is mounted with `v-if="item"`, so a page turn, a search or an optimistic
// Removal takes the row out of the list and unmounts the dialog mid-edit while the target ref stays set — and the
// Dialog then re-opens by itself, over that same row, the moment a later read brings it back into the list
export const useSingletonDialog = (target: Ref<string>, getItem?: () => unknown) => {
  if (getItem)
    watch(getItem, (newItem) => {
      if (!newItem) target.value = "";
    });
  return computed({
    get: () => Boolean(target.value),
    set: (value) => {
      if (value) return;
      target.value = "";
    },
  });
};
