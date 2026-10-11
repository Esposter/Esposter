import type { DefaultTreeAdapterTypes } from "parse5";
import type { SanitizePolicy } from "#src/models/sanitizeHtml/SanitizePolicy";

import { filterClasses } from "#src/services/sanitizeHtml/filterClasses";
import { filterSrcset } from "#src/services/sanitizeHtml/filterSrcset";
import { filterStyle } from "#src/services/sanitizeHtml/filterStyle";
import { isAllowedUrl } from "#src/services/sanitizeHtml/isAllowedUrl";
import { SRCSET_ATTRIBUTE, URL_ATTRIBUTES } from "#src/services/sanitizeHtml/constants";

// Keeps the attributes a tag's policy names, each in the form the policy allows. A transform runs first, so what it
// Writes is filtered like the markup it replaced. Attribute names come from the parser already lower-cased
export const filterAttributes = (
  element: DefaultTreeAdapterTypes.Element,
  policy: SanitizePolicy,
): Record<string, string> => {
  const { tagName } = element;
  const allowedAttributes =
    (Object.hasOwn(policy.allowedAttributes, tagName) ? policy.allowedAttributes[tagName] : undefined) ?? [];
  const isClassAllowed = Object.hasOwn(policy.allowedClasses, tagName);
  const parsedAttributes = Object.fromEntries(element.attrs.map(({ name, value }) => [name, value]));
  const transform = Object.hasOwn(policy.transformAttributes, tagName)
    ? policy.transformAttributes[tagName]
    : undefined;
  const attributes = transform ? transform(parsedAttributes) : parsedAttributes;

  const kept: Record<string, string> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (name === "class" ? !isClassAllowed : !allowedAttributes.includes(name)) continue;

    const filteredValue = filterValue(tagName, name, value, policy);
    if (filteredValue !== undefined) kept[name] = filteredValue;
  }
  return kept;
};

const filterValue = (tagName: string, name: string, value: string, policy: SanitizePolicy): string | undefined => {
  if (name === "style")
    return filterStyle(value, Object.hasOwn(policy.allowedStyles, tagName) ? policy.allowedStyles[tagName] : undefined);
  if (name === "class")
    return filterClasses(
      value,
      Object.hasOwn(policy.allowedClasses, tagName) ? policy.allowedClasses[tagName] : undefined,
    );
  if (name === SRCSET_ATTRIBUTE) return filterSrcset(value, policy.allowedSchemes);
  if (URL_ATTRIBUTES.includes(name)) return isAllowedUrl(value, policy.allowedSchemes) ? value : undefined;
  return value;
};
