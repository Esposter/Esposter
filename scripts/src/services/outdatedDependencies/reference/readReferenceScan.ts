import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { ReferenceScan } from "#src/models/outdatedDependencies/shared/ReferenceScan";
import type { UnpinnedReference } from "#src/models/outdatedDependencies/shared/UnpinnedReference";

import { parseWorkflowReferences } from "#src/services/outdatedDependencies/githubActions/parseWorkflowReferences";
import { GITHUB_DIRECTORY } from "#src/services/outdatedDependencies/reference/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The workflows and composite actions among `paths`, which between them hold each version the repo declares outside
// The npm ecosystem. A reference repeated across files is one entry, since it is one release to ask about; every
// Unpinned one is kept with its file, since each is a line to fix
export const readReferenceScan = (paths: string[]): ReferenceScan => {
  const entryMap = new Map<string, DependencyEntry>();
  const unpinned: UnpinnedReference[] = [];

  for (const path of paths) {
    if (!path.startsWith(GITHUB_DIRECTORY)) continue;

    const text = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
    const scan = parseWorkflowReferences(path, text);
    for (const entry of scan.entries)
      entryMap.set(`${entry.group} ${entry.packageName} ${entry.specifier} ${entry.digest ?? ""}`, entry);
    unpinned.push(...scan.unpinned);
  }

  return { entries: [...entryMap.values()], unpinned };
};
