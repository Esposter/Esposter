import { checkIsKitAtom } from "#src/services/genshinAssets/kits/record/checkIsKitAtom";

// Whether two values of a kit's record are the same value: equal numbers, strings or booleans, both undefined, or an
// Area or a table's parameter whose every field is equal
export const checkIsKitValueEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) return true;
  else if (
    typeof left !== "object" ||
    typeof right !== "object" ||
    left === null ||
    right === null ||
    !checkIsKitAtom(left) ||
    !checkIsKitAtom(right)
  )
    return false;
  const leftEntries = Object.entries(left);
  return (
    leftEntries.length === Object.keys(right).length &&
    leftEntries.every(([key, value]) => (right as Record<string, unknown>)[key] === value)
  );
};
