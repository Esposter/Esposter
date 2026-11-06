// The value one field holds across the selected elements: the one value every element holds, or Mixed when they differ
export type MixedValue<T> = { isMixed: false; value: T } | { isMixed: true };
