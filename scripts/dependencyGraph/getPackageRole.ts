import type { WorkspaceEdges } from "#scripts/dependencyGraph/models/WorkspaceEdges";

import { PackageRole } from "#scripts/dependencyGraph/models/PackageRole";

// Entrypoint is checked against both edge kinds and foundation against runtime alone: a package a sibling only
// Ever builds against is still not something this repo ships, but a dev-only edge out of it says nothing about
// What its shipped code rests on.
export const getPackageRole = (directory: string, { development, runtime }: WorkspaceEdges): PackageRole => {
  if (!runtime.some(({ to }) => to === directory) && !development.some(({ to }) => to === directory))
    return PackageRole.Entrypoint;
  else if (runtime.some(({ from }) => from === directory)) return PackageRole.Library;
  return PackageRole.Foundation;
};
