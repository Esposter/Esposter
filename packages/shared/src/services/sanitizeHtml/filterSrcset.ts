import { isAllowedUrl } from "#src/services/sanitizeHtml/isAllowedUrl";
import { isWhitespaceCharacter } from "#src/services/sanitizeHtml/isWhitespaceCharacter";
import { SRCSET_DESCRIPTOR_REGEX } from "#src/services/sanitizeHtml/constants";

const COMMA = ",";
const OPENING_PARENTHESIS = "(";
const CLOSING_PARENTHESIS = ")";

// Reads a srcset the way the HTML standard does: a candidate's URL is the run of non-space characters, so a comma inside
// It (a CDN's transform list) stays in the URL, and only a comma that ends the URL or ends the descriptors separates
// Candidates. A candidate whose URL the schemes refuse, or whose descriptor the standard does not allow, is dropped
export const filterSrcset = (value: string, allowedSchemes: string[]): string | undefined => {
  const candidates: string[] = [];
  let position = 0;
  while (position < value.length) {
    while (
      position < value.length &&
      (isWhitespaceCharacter(value.charAt(position)) || value.charAt(position) === COMMA)
    )
      position++;

    const urlStart = position;
    while (position < value.length && !isWhitespaceCharacter(value.charAt(position))) position++;
    let url = value.slice(urlStart, position);
    let descriptorText = "";
    if (url.endsWith(COMMA)) url = url.replace(/,+$/u, "");
    else {
      const descriptorStart = position;
      let isInParentheses = false;
      while (position < value.length && (isInParentheses || value.charAt(position) !== COMMA)) {
        if (value.charAt(position) === OPENING_PARENTHESIS) isInParentheses = true;
        else if (value.charAt(position) === CLOSING_PARENTHESIS) isInParentheses = false;
        position++;
      }
      descriptorText = value.slice(descriptorStart, position);
      position++;
    }

    const descriptors = descriptorText.trim().split(/\s+/u).filter(Boolean);
    if (!url || !isAllowedUrl(url, allowedSchemes)) continue;
    if (descriptors.length > 1 || descriptors.some((descriptor) => !SRCSET_DESCRIPTOR_REGEX.test(descriptor))) continue;

    candidates.push([url, ...descriptors].join(" "));
  }
  return candidates.length > 0 ? candidates.join(", ") : undefined;
};
