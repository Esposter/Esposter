// Writable v-dialog model over a singleton dialog target ref (e.g. deletingId):
// Open while the target is set, closing resets the target back to "".
export const useSingletonDialog = (target: Ref<string>) =>
  computed({
    get: () => Boolean(target.value),
    set: (value) => {
      if (value) return;
      target.value = "";
    },
  });
