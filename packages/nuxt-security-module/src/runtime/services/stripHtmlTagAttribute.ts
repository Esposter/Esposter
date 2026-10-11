import { HTML_ATTRIBUTE_REGEX } from "#src/runtime/constants";

// The attribute text with every attribute of the given name removed, matched token by token.
// So an attribute whose name appears inside another attribute's quoted value is kept.
export const stripHtmlTagAttribute = (attributes: string, attributeName: string): string =>
  attributes.replace(HTML_ATTRIBUTE_REGEX, (token, name: string) =>
    name.toLowerCase() === attributeName ? "" : token,
  );
