// Reads and writes through whichever ref the binder resolves at that moment, so the key is resolved per access
// Rather than pinned when the view was created
export const getBoundComputed = <TValue>(bind: () => Ref<TValue>) =>
  computed({
    get: () => bind().value,
    set: (newValue) => {
      bind().value = newValue;
    },
  });
