import type { PnpmDependency } from "#src/models/dependencyGraph/PnpmDependency";
import type { PnpmProject } from "#src/models/dependencyGraph/PnpmProject";
import type { WorkspaceEdge } from "#src/models/dependencyGraph/WorkspaceEdge";
import type { WorkspaceEdges } from "#src/models/dependencyGraph/WorkspaceEdges";
import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import { LINK_PREFIX } from "#src/services/dependencyGraph/constants";
import { getEdgeKey } from "#src/services/dependencyGraph/getEdgeKey";
import { getSortedEdges } from "#src/services/dependencyGraph/getSortedEdges";

// A sibling is an edge where pnpm links it, a `link:` to its folder. The runtime fields are `dependencies` and
// `optionalDependencies`, as opposed to `devDependencies`, which only the package's build, lint, test and bench
// Runs reach. Drawing the two apart is the whole point of this graph: every package depends on
// `@esposter/configuration`, and reading that as a runtime edge inverts what the repo actually is.
export const getWorkspaceEdges = (
  workspacePackages: WorkspacePackage[],
  pnpmProjects: PnpmProject[],
): WorkspaceEdges => {
  const nameDirectoryMap = new Map(
    workspacePackages.flatMap(({ directory, manifest }) =>
      manifest.name === undefined ? [] : [[manifest.name, directory] as const],
    ),
  );
  const getLinkedDirectories = (dependencies: Record<string, PnpmDependency> = {}): string[] =>
    Object.entries(dependencies).flatMap(([name, { version }]) => {
      const directory = nameDirectoryMap.get(name);
      return directory !== undefined && version.startsWith(LINK_PREFIX) ? [directory] : [];
    });
  const runtime = new Map<string, WorkspaceEdge>();
  const development = new Map<string, WorkspaceEdge>();

  for (const { dependencies, devDependencies, name, optionalDependencies } of pnpmProjects) {
    // The root project is no workspace package, so it has no directory to draw from and no edge
    const from = nameDirectoryMap.get(name);
    if (from === undefined) continue;

    for (const to of [...getLinkedDirectories(dependencies), ...getLinkedDirectories(optionalDependencies)]) {
      const workspaceEdge = { from, to };
      runtime.set(getEdgeKey(workspaceEdge), workspaceEdge);
    }

    for (const to of getLinkedDirectories(devDependencies)) {
      const workspaceEdge = { from, to };
      development.set(getEdgeKey(workspaceEdge), workspaceEdge);
    }
  }
  // A sibling declared in both fields is one runtime edge that a test also happens to import, so the
  // Development copy is dropped rather than drawn twice between the same pair.
  for (const key of runtime.keys()) development.delete(key);

  return { development: getSortedEdges(development), runtime: getSortedEdges(runtime) };
};
