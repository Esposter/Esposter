import { ESCAPED_TEXT_CHARACTERS_REGEX } from "#src/services/sanitizeHtml/constants";

const ESCAPED_TEXT_CHARACTERS: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
const NON_BREAKING_SPACE = String.fromCodePoint(0xa0);

export const escapeText = (text: string): string =>
  text
    .replace(ESCAPED_TEXT_CHARACTERS_REGEX, (character) => ESCAPED_TEXT_CHARACTERS[character] ?? character)
    .replaceAll(NON_BREAKING_SPACE, "&nbsp;");
