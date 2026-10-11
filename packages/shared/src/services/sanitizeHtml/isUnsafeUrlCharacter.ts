import { isWhitespaceCharacter } from "#src/services/sanitizeHtml/isWhitespaceCharacter";

const FIRST_PRINTABLE_CODE_POINT = 0x20;
const DELETE_CODE_POINT = 0x7f;
const LAST_C1_CONTROL_CODE_POINT = 0x9f;
const GRAVE_ACCENT = "`";

// The characters a browser's URL parser drops before it reads a scheme, widened to every space, control and grave
// Accent. A wider set only reads a scheme in more places, which the check is built to tolerate
export const isUnsafeUrlCharacter = (character: string): boolean => {
  const codePoint = character.codePointAt(0) ?? 0;
  return (
    isWhitespaceCharacter(character) ||
    codePoint < FIRST_PRINTABLE_CODE_POINT ||
    (codePoint >= DELETE_CODE_POINT && codePoint <= LAST_C1_CONTROL_CODE_POINT) ||
    character === GRAVE_ACCENT
  );
};
