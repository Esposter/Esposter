// A writable view onto one property of whatever object the source currently holds — a plain `toRef` would pin
// The object it was handed, and the source is replaced wholesale every time a slice reloads
export const getPropertyComputed = <TSource extends object, TKey extends keyof TSource>(
  source: Ref<TSource>,
  key: TKey,
) =>
  computed({
    get: () => source.value[key],
    set: (newValue) => {
      source.value[key] = newValue;
    },
  });
