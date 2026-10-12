import { IMPORTANT_REGEX } from "#src/services/sanitizeHtml/constants";

const DECLARATION_SEPARATOR = ";";
const PROPERTY_SEPARATOR = ":";
const IMPORTANT_SUFFIX = "!important";

// A declaration survives only when its property is named for the tag and its value matches one of that property's
// Expressions in full. The expressions are the policy's own, so a value they accept is the one value a rule allows.
// A property written twice keeps the value the cascade reads: an !important one beats a later one that is not, and
// Otherwise the last wins, so a layout written over an author's is the same layout the second time it is filtered
export const filterStyle = (value: string, rules: Record<string, RegExp[]> | undefined): string | undefined => {
  if (!rules) return undefined;

  const declarations = new Map<string, { important: boolean; propertyValue: string }>();
  for (const declaration of value.split(DECLARATION_SEPARATOR)) {
    const separatorIndex = declaration.indexOf(PROPERTY_SEPARATOR);
    if (separatorIndex === -1) continue;

    const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
    if (!Object.hasOwn(rules, property)) continue;

    const rawValue = declaration.slice(separatorIndex + 1).trim();
    const important = IMPORTANT_REGEX.test(rawValue);
    const propertyValue = rawValue.replace(IMPORTANT_REGEX, "").trim();
    if (!(rules[property] ?? []).some((rule) => rule.test(propertyValue))) continue;

    if (declarations.get(property)?.important && !important) continue;
    declarations.set(property, { important, propertyValue });
  }
  if (declarations.size === 0) return undefined;

  return Array.from(
    declarations,
    ([property, { important, propertyValue }]) =>
      `${property}${PROPERTY_SEPARATOR}${propertyValue}${important ? IMPORTANT_SUFFIX : ""}`,
  ).join(DECLARATION_SEPARATOR);
};
