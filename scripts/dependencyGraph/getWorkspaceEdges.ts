import type { WorkspaceEdge } from "#scripts/dependencyGraph/models/WorkspaceEdge";
import type { WorkspaceEdges } from "#scripts/dependencyGraph/models/WorkspaceEdges";
import type { WorkspacePackage } from "#scripts/models/WorkspacePackage";

import { RUNTIME_DEPENDENCY_FIELDS, WORKSPACE_SPECIFIER_PREFIX } from "#scripts/dependencyGraph/constants";
import { DependencyField } from "#scripts/models/DependencyField";

const getEdgeKey = ({ from, to }: WorkspaceEdge): string => `${from}/${to}`;
// Ordered by `<` on the key rather than by `localeCompare`, so the order is UTF-16 code units rather than the
// Machine's collation. The svg this feeds is committed, and a locale-dependent order would rewrite it on someone
// Else's machine.
const getSortedEdges = (workspaceEdges: Map<string, WorkspaceEdge>): WorkspaceEdge[] =>
  workspaceEdges
    .values()
    .toArray()
    .toSorted((left, right) => (getEdgeKey(left) < getEdgeKey(right) ? -1 : 1));

export const getWorkspaceEdges = (workspacePackages: WorkspacePackage[]): WorkspaceEdges => {
  const nameDirectoryMap = new Map(
    workspacePackages.flatMap(({ directory, manifest }) =>
      manifest.name === undefined ? [] : [[manifest.name, directory] as const],
    ),
  );
  const getDependencyDirectories = (dependencies: Record<string, string> = {}): string[] =>
    Object.entries(dependencies).flatMap(([name, specifier]) => {
      const directory = nameDirectoryMap.get(name);
      return directory !== undefined && specifier.startsWith(WORKSPACE_SPECIFIER_PREFIX) ? [directory] : [];
    });
  const runtime = new Map<string, WorkspaceEdge>();
  const development = new Map<string, WorkspaceEdge>();

  for (const { directory, manifest } of workspacePackages) {
    for (const field of RUNTIME_DEPENDENCY_FIELDS)
      for (const to of getDependencyDirectories(manifest[field]))
        runtime.set(getEdgeKey({ from: directory, to }), { from: directory, to });

    for (const to of getDependencyDirectories(manifest[DependencyField.DevDependencies]))
      development.set(getEdgeKey({ from: directory, to }), { from: directory, to });
  }
  // A sibling declared in both fields is one runtime edge that a test also happens to import, so the
  // Development copy is dropped rather than drawn twice between the same pair.
  for (const key of runtime.keys()) development.delete(key);

  return { development: getSortedEdges(development), runtime: getSortedEdges(runtime) };
};
