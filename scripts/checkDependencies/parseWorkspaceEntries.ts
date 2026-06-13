import type { DependencyEntry } from "@/checkDependencies/models/DependencyEntry";

export const parseWorkspaceEntries = (group: string, section: string): DependencyEntry[] => {
  const entries: DependencyEntry[] = [];

  for (const { groups } of section.matchAll(/^[ ]{2}['"]?(?<pkg>[^'":\n]+)['"]?:\s*(?<specifier>.+)$/gmu)) {
    const pkg = groups?.pkg;
    const specifier = groups?.specifier;
    if (!pkg || !specifier) continue;

    entries.push({ group, pkg: pkg.trim(), specifier: specifier.trim() });
  }

  return entries;
};
