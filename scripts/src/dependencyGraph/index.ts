import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { getGraphSvg } from "#src/services/dependencyGraph/getGraphSvg";
import { getWorkspaceEdges } from "#src/services/dependencyGraph/getWorkspaceEdges";
import { readPnpmProjects } from "#src/services/dependencyGraph/readPnpmProjects";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { timeCommand } from "#src/services/timing/timeCommand";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

timeCommand("graph:gen");

const workspacePackages = readWorkspacePackages(REPOSITORY_ROOT);
const workspaceEdges = getWorkspaceEdges(workspacePackages, readPnpmProjects());

writeFileSync(resolve(REPOSITORY_ROOT, GRAPH_FILENAME), await getGraphSvg(workspacePackages, workspaceEdges));
console.info(
  `${GRAPH_FILENAME}: ${workspacePackages.length} packages, ${workspaceEdges.runtime.length} runtime and ${workspaceEdges.development.length} development edges`,
);
