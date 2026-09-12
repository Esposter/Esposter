import { REPOSITORY_ROOT } from "#src/services/constants";
import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { getGraphSvg } from "#src/services/dependencyGraph/getGraphSvg";
import { getWorkspaceEdges } from "#src/services/dependencyGraph/getWorkspaceEdges";
import { getWorkspacePackages } from "#src/services/getWorkspacePackages";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const workspacePackages = getWorkspacePackages(REPOSITORY_ROOT);
const workspaceEdges = getWorkspaceEdges(workspacePackages);

writeFileSync(resolve(REPOSITORY_ROOT, GRAPH_FILENAME), await getGraphSvg(workspacePackages, workspaceEdges));
console.info(
  `${GRAPH_FILENAME}: ${String(workspacePackages.length)} packages, ${String(workspaceEdges.runtime.length)} runtime and ${String(workspaceEdges.development.length)} development edges`,
);
