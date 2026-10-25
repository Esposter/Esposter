import type { WorkspaceEdges } from "#src/models/dependencyGraph/WorkspaceEdges";
import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import { getPackageRole } from "#src/services/dependencyGraph/getPackageRole";
import { PackageRoleColorsMap } from "#src/services/dependencyGraph/PackageRoleColorsMap";

// A private package is drawn dashed: nothing installs it, so its edges are internal wiring rather than a
// Promise to anyone outside this repo. The role decides the colour, and it is read off the edges rather than
// Off a list, so a package that starts being depended on changes colour on the next run without anyone saying
// So.
export const getNodeLine = ({ directory, manifest }: WorkspacePackage, workspaceEdges: WorkspaceEdges): string => {
  const { deepFill, paleFill, stroke } = PackageRoleColorsMap[getPackageRole(directory, workspaceEdges)];
  const style = manifest.private === true ? "filled,dashed" : "filled";
  return `"${directory}" [fillcolor="${paleFill}:${deepFill}" color="${stroke}" style="${style}"];`;
};
