import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { readGraph } from "#src/services/dependencyGraph/readGraph";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { timeCommand } from "#src/services/timing/timeCommand";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

timeCommand("graph:gen");

const { svg, workspaceEdges, workspacePackages } = await readGraph();

writeFileSync(resolve(REPOSITORY_ROOT, GRAPH_FILENAME), svg);
console.info(
  `${GRAPH_FILENAME}: ${workspacePackages.length} packages, ${workspaceEdges.runtime.length} runtime and ${workspaceEdges.development.length} development edges`,
);
