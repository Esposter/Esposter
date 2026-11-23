// A parent side containment can measure: finite and above zero. A zero or non-finite side has no containment on its
// Axis
export const checkIsContainableLength = (length: number): boolean => Number.isFinite(length) && length > 0;
