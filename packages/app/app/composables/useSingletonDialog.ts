// Writable v-dialog model over a singleton dialog target ref (e.g. deletingId):
// Open while the target is set, closing resets the target back to "".
// A dialog the user can hold open while its list re-reads underneath it resolves its item through
// `useSingletonDialogTarget`, which is what keeps a target from outliving the row it names
export const useSingletonDialog = (target: Ref<string>) =>
  computed({
    get: () => Boolean(target.value),
    set: (value) => {
      if (value) return;
      target.value = "";
    },
  });
