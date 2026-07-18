import { toKebabCase } from "@esposter/shared";

// Derives a unique local alias per captured resource from its name — kebab-cased, and disambiguated with a
// Numeric suffix when two names collide, so every entry key is unique within the manifest
export const getBlueprintEntryKeys = (names: string[]): string[] => {
  const countByBase = new Map<string, number>();
  return names.map((name) => {
    const base = toKebabCase(name) || "entry";
    const count = countByBase.get(base) ?? 0;
    countByBase.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
};
