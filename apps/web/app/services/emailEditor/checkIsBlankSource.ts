import { normalizeString } from "@esposter/shared";

// A source of only whitespace has nothing to import, so the import stays off until the source holds a character
export const checkIsBlankSource = (source: string) => !normalizeString(source);
