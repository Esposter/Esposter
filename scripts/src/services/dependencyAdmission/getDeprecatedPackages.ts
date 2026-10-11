// A `packages:` entry carrying a `deprecated:` field, whose body is indented four spaces and ends at the next key
const DEPRECATED_REGEX =
  /^ {2}['"]?(?<key>[^\s'"#][^'"\n]*?)['"]?:\n(?: {4}[^\n]*\n)*? {4}deprecated: (?<message>[^\n]+)$/gmu;

// Maps each deprecated `packages:` key to the message npm gave for it
export const getDeprecatedPackages = (lockYaml: string): Map<string, string> => {
  const deprecatedPackages = new Map<string, string>();

  for (const { groups } of lockYaml.matchAll(DEPRECATED_REGEX)) {
    const key = groups?.key;
    const message = groups?.message?.trim();
    if (!key || !message) continue;

    deprecatedPackages.set(key, message);
  }

  return deprecatedPackages;
};
