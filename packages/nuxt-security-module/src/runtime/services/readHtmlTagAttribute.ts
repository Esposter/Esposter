import { HTML_ATTRIBUTE_REGEX } from "#src/runtime/constants";
import { unquote } from "#src/runtime/services/unquote";

// The value of one attribute in a start tag's attribute text, `undefined` when the attribute is absent.
// An attribute name is compared without regard to case, as HTML compares it
export const readHtmlTagAttribute = (attributes: string, attributeName: string): string | undefined => {
  for (const [, name, , value] of attributes.matchAll(HTML_ATTRIBUTE_REGEX))
    if (name?.toLowerCase() === attributeName) return unquote(value ?? "");

  return undefined;
};
