import { checkIsUnsafeUrlCharacter } from "#src/services/sanitizeHtml/checkIsUnsafeUrlCharacter";
import { takeOne } from "#src/util/array/takeOne";

const PATH_DELIMITER_REGEX = /[/?#]/u;
const NON_SCHEME_CHARACTERS_REGEX = /[^a-z\d+.-]/giu;
const SCHEME_SEPARATOR = ":";

// The scheme is read before any path, query or fragment begins, after the characters a browser's URL parser drops, so a
// Tab or a stray character before the colon cannot hide a javascript: scheme. What remains before the colon must be an
// Allowed scheme, and a value with no colon before its path is relative, which names no script. A browser that reads
// Such a value differently is refused as well, so the check never depends on how a browser reads it
export const checkIsAllowedUrl = (url: string, allowedSchemes: string[]): boolean => {
  const normalizedUrl = url
    .split("")
    .filter((character) => !checkIsUnsafeUrlCharacter(character))
    .join("");
  const beforePath = takeOne(normalizedUrl.split(PATH_DELIMITER_REGEX), 0);
  const separatorIndex = beforePath.indexOf(SCHEME_SEPARATOR);
  if (separatorIndex === -1) return true;

  const scheme = beforePath.slice(0, separatorIndex).replaceAll(NON_SCHEME_CHARACTERS_REGEX, "").toLowerCase();
  return allowedSchemes.includes(scheme);
};
