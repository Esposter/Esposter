import { ESCAPED_ATTRIBUTE_CHARACTERS_REGEX } from "#src/services/sanitizeHtml/constants";
import { escapeCharacters } from "#src/services/sanitizeHtml/escapeCharacters";

const ESCAPED_ATTRIBUTE_CHARACTERS: Record<string, string> = { '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" };

export const escapeAttribute = (value: string): string =>
  escapeCharacters(value, ESCAPED_ATTRIBUTE_CHARACTERS_REGEX, ESCAPED_ATTRIBUTE_CHARACTERS);
