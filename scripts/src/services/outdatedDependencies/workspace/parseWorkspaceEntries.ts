import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";
import type { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

const ENTRY_REGEX = /^[ ]{2}['"]?(?<packageName>[^'":\n]+)['"]?:\s*(?<specifier>.+)$/gmu;

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
