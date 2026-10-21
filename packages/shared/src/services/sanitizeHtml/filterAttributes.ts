import type { SanitizePolicy } from "#src/models/sanitizeHtml/SanitizePolicy";
import type { DefaultTreeAdapterTypes } from "parse5";

import { checkIsAllowedUrl } from "#src/services/sanitizeHtml/checkIsAllowedUrl";
import { SRCSET_ATTRIBUTE, URL_ATTRIBUTES } from "#src/services/sanitizeHtml/constants";
import { filterClasses } from "#src/services/sanitizeHtml/filterClasses";
import { filterSrcset } from "#src/services/sanitizeHtml/filterSrcset";
import { filterStyle } from "#src/services/sanitizeHtml/filterStyle";

// The entry a tag's policy names, or undefined when the policy names none for that tag
const getTagPolicy = <T>(tagPolicies: Record<string, T>, tagName: string): T | undefined =>
  Object.hasOwn(tagPolicies, tagName) ? tagPolicies[tagName] : undefined;

// A meta refresh navigates to the URL its content names, so that content is never kept: without it the refresh does nothing
const checkIsMetaRefresh = (tagName: string, attributes: Record<string, string>): boolean =>
  tagName === "meta" && attributes["http-equiv"]?.trim().toLowerCase() === "refresh";

// Keeps the attributes a tag's policy names, each in the form the policy allows. A transform runs first, so what it
// Writes is filtered like the markup it replaced. Attribute names come from the parser already lower-cased
export const filterAttributes = (
  element: DefaultTreeAdapterTypes.Element,
  policy: SanitizePolicy,
): Record<string, string> => {
  const { tagName } = element;
  const allowedAttributes = getTagPolicy(policy.allowedAttributes, tagName) ?? [];
  const isClassAllowed = Object.hasOwn(policy.allowedClasses, tagName);
  const parsedAttributes = Object.fromEntries(element.attrs.map(({ name, value }) => [name, value]));
  const transform = getTagPolicy(policy.transformAttributes, tagName);
  const attributes = transform ? transform(parsedAttributes) : parsedAttributes;

  const kept: Record<string, string> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (name === "class" ? !isClassAllowed : !allowedAttributes.includes(name)) continue;
    if (name === "content" && checkIsMetaRefresh(tagName, attributes)) continue;

    const filteredValue = filterValue(tagName, name, value, policy);
    if (filteredValue !== undefined) kept[name] = filteredValue;
  }
  return kept;
};

const filterValue = (tagName: string, name: string, value: string, policy: SanitizePolicy): string | undefined => {
  if (name === "style") return filterStyle(value, getTagPolicy(policy.allowedStyles, tagName));
  if (name === "class") return filterClasses(value, getTagPolicy(policy.allowedClasses, tagName));
  if (name === SRCSET_ATTRIBUTE) return filterSrcset(value, policy.allowedSchemes);
  if (URL_ATTRIBUTES.includes(name)) return checkIsAllowedUrl(value, policy.allowedSchemes) ? value : undefined;
  return value;
};
