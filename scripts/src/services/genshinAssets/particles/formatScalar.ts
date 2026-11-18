import { formatNumbers } from "#src/services/genshinAssets/shared/formatNumbers";

// A single number as text, in the same form as a list of numbers
export const formatScalar = (value: number): string => formatNumbers([value]);
