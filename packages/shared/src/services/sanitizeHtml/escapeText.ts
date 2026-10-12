import { ESCAPED_TEXT_CHARACTERS_REGEX } from "#src/services/sanitizeHtml/constants";
import { escapeCharacters } from "#src/services/sanitizeHtml/escapeCharacters";

const ESCAPED_TEXT_CHARACTERS: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

export const escapeText = (text: string): string =>
  escapeCharacters(text, ESCAPED_TEXT_CHARACTERS_REGEX, ESCAPED_TEXT_CHARACTERS);
