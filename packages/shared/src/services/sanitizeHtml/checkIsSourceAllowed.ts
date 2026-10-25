import type { SanitizePolicy } from "#src/models/sanitizeHtml/SanitizePolicy";
import type { DefaultTreeAdapterTypes } from "parse5";

// An element whose tag a policy names a source for is kept only when every source attribute it names is present and
// Matches one of its patterns. A tag with no source rule is kept as its tag policy allows
export const checkIsSourceAllowed = (
  element: DefaultTreeAdapterTypes.Element,
  allowedSources: SanitizePolicy["allowedSources"],
): boolean => {
  const sourceRules = Object.hasOwn(allowedSources, element.tagName) ? allowedSources[element.tagName] : undefined;
  if (!sourceRules) return true;

  return Object.entries(sourceRules).every(([name, patterns]) => {
    const attribute = element.attrs.find((attr) => attr.name === name);
    return attribute !== undefined && patterns.some((pattern) => pattern.test(attribute.value));
  });
};
