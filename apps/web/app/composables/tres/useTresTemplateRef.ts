// A template ref to a Tres element, read back as the Three object itself. In development `useTemplateRef` wraps its
// Ref in a deep `readonly`, and a Three object is a plain class instance the proxy reaches into, so every write
// Through it — a position, a rotation — fails with a warning while production, which skips the wrapper, applies it
export const useTresTemplateRef = <T extends object>(key: string) => {
  const templateRef = useTemplateRef<T>(key);
  return computed(() => (templateRef.value ? toRaw(templateRef.value) : undefined));
};
