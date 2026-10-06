import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

// A key and its specifier, either quoted or bare. A comment line is no entry, so a key never opens with `#`
const ENTRY_REGEX = /^[ ]{2}['"]?(?<packageName>[^'":\n#][^'":\n]*)['"]?:\s*['"]?(?<specifier>[^'"\n]+)['"]?$/gmu;

export const parseWorkspaceEntries = (group: DependencyGroup, section: string): DependencyEntry[] => {
  const entries: DependencyEntry[] = [];

  for (const { groups } of section.matchAll(ENTRY_REGEX)) {
    const packageName = groups?.packageName;
    const specifier = groups?.specifier;
    if (!packageName || !specifier) continue;

    entries.push({ group, packageName: packageName.trim(), specifier: specifier.trim() });
  }

  return entries;
};
