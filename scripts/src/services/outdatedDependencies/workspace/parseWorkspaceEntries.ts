import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";
import type { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

const ENTRY_REGEX = /^[ ]{2}['"]?(?<pkg>[^'":\n]+)['"]?:\s*(?<specifier>.+)$/gmu;

export const parseWorkspaceEntries = (group: DependencyGroup, section: string): DependencyEntry[] => {
  const entries: DependencyEntry[] = [];

  for (const { groups } of section.matchAll(ENTRY_REGEX)) {
    const pkg = groups?.pkg;
    const specifier = groups?.specifier;
    if (!pkg || !specifier) continue;

    entries.push({ group, pkg: pkg.trim(), specifier: specifier.trim() });
  }

  return entries;
};
