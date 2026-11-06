import type { MixedValue } from "@/models/editor/MixedValue";

import { takeOne } from "@esposter/shared";

// The one value every element holds, or Mixed when they differ. Values compare with ===, so a field of objects is refused at the type: two
// objects with the same content are still two values. No element selected has no value to show
export const getMixedValue = <T extends boolean | number | string>(values: T[]): MixedValue<T> | undefined => {
  if (values.length === 0) return undefined;
  const firstValue = takeOne(values, 0);
  return values.every((value) => value === firstValue) ? { isMixed: false, value: firstValue } : { isMixed: true };
};
