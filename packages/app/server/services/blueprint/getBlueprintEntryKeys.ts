import { MAX_BLUEPRINT_KEY_LENGTH } from "#shared/services/resource/blueprint/constants";
import { toKebabCase } from "@esposter/shared";

// Derives a unique local alias per captured resource from its name — kebab-cased, and disambiguated with a
// Numeric suffix when two names collide, so every entry key is unique within the manifest.
// Kebab-casing inserts a separator at every word boundary, so it can return a key longer than the name it
// Came from — every key is clamped (leaving room for the suffix) because the manifest is read back through
// The same schema that bounds it: a key over the bound writes a blueprint that can never be opened or
// Deployed again, with no path in the editor to shorten it
export const getBlueprintEntryKeys = (names: string[]): string[] => {
  const baseCountMap = new Map<string, number>();
  const usedKeys = new Set<string>();
  return names.map((name) => {
    const base = (toKebabCase(name) || "entry").slice(0, MAX_BLUEPRINT_KEY_LENGTH);
    const buildSuffixedKey = (suffixCount: number) => {
      const suffix = `-${suffixCount + 1}`;
      return `${base.slice(0, MAX_BLUEPRINT_KEY_LENGTH - suffix.length)}${suffix}`;
    };
    let count = baseCountMap.get(base) ?? 0;
    // A suffixed key can transitively collide with another name's natural key (e.g. "report" ×2 and
    // "report-2"), so keep bumping until the key is genuinely unused
    let key = count === 0 ? base : buildSuffixedKey(count);
    while (usedKeys.has(key)) {
      count += 1;
      key = buildSuffixedKey(count);
    }
    baseCountMap.set(base, count + 1);
    usedKeys.add(key);
    return key;
  });
};
