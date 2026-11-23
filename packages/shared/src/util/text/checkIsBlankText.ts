import { normalizeString } from "#src/util/text/normalizeString";

// A field holding spaces is blank.
// A component cannot trim (`normalizeString` is banned in a `.vue` file), so it asks this function.
export const checkIsBlankText = (value: string | undefined): boolean => normalizeString(value) === "";
