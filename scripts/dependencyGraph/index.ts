import { GRAPH_FILENAME } from "#scripts/dependencyGraph/constants";
import { getGraphSvg } from "#scripts/dependencyGraph/getGraphSvg";
import { getWorkspaceEdges } from "#scripts/dependencyGraph/getWorkspaceEdges";
import { getWorkspacePackages } from "#scripts/services/getWorkspacePackages";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const workspacePackages = getWorkspacePackages(root);
const workspaceEdges = getWorkspaceEdges(workspacePackages);

writeFileSync(resolve(root, GRAPH_FILENAME), await getGraphSvg(workspacePackages, workspaceEdges));
console.info(
  `${GRAPH_FILENAME}: ${String(workspacePackages.length)} packages, ${String(workspaceEdges.runtime.length)} runtime and ${String(workspaceEdges.development.length)} development edges`,
);
