import { parseRange } from "#src/services/semver/parseRange";

export const checkIsValidRange = (range: string): boolean => parseRange(range, false) !== undefined;
