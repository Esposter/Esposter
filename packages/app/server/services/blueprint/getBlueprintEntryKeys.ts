import { toKebabCase } from "@esposter/shared";

// Derives a unique local alias per captured resource from its name — kebab-cased, and disambiguated with a
// Numeric suffix when two names collide, so every entry key is unique within the manifest
export const getBlueprintEntryKeys = (names: string[]): string[] => {
  const countByBase = new Map<string, number>();
  const usedKeys = new Set<string>();
  return names.map((name) => {
    const base = toKebabCase(name) || "entry";
    let count = countByBase.get(base) ?? 0;
    // A suffixed key can transitively collide with another name's natural key (e.g. "report" ×2 and
    // "report-2"), so keep bumping until the key is genuinely unused
    let key = count === 0 ? base : `${base}-${count + 1}`;
    while (usedKeys.has(key)) {
      count += 1;
      key = `${base}-${count + 1}`;
    }
    countByBase.set(base, count + 1);
    usedKeys.add(key);
    return key;
  });
};
