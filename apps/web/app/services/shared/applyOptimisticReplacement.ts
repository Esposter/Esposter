import { noop } from "@esposter/shared";

// An optimistic write that replaces what a ref holds, such as a list with a row taken out, and returns the rollback. The
// Rollback puts the old value back only while the ref still holds this write's, so a read or a later write that
// Replaced it since keeps what it wrote
export const applyOptimisticReplacement = <T>(
  source: Ref<T>,
  getNextValue: (value: NonNullable<T>) => NonNullable<T>,
) => {
  const previousValue = source.value;
  // A ref still waiting on its first read has nothing to replace
  if (previousValue === undefined || previousValue === null) return noop;

  const nextValue = getNextValue(previousValue);
  source.value = nextValue;
  return () => {
    if (source.value === nextValue) source.value = previousValue;
  };
};
