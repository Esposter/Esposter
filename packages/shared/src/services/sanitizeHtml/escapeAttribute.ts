import { ESCAPED_ATTRIBUTE_CHARACTERS_REGEX } from "#src/services/sanitizeHtml/constants";

const ESCAPED_ATTRIBUTE_CHARACTERS: Record<string, string> = { '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" };
const NON_BREAKING_SPACE = String.fromCodePoint(0xa0);

export const escapeAttribute = (value: string): string =>
  value
    .replace(ESCAPED_ATTRIBUTE_CHARACTERS_REGEX, (character) => ESCAPED_ATTRIBUTE_CHARACTERS[character] ?? character)
    .replaceAll(NON_BREAKING_SPACE, "&nbsp;");
