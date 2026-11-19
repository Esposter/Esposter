import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { readGraph } from "#src/services/dependencyGraph/readGraph";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

await runCommand(
  defineCommand({
    meta: {
      description:
        "Draw the workspace's package graph to dependency-graph.svg, with its runtime and development edges counted",
      name: "graph:gen",
    },
    run: async () => {
      const { svg, workspaceEdges, workspacePackages } = await readGraph();

      writeFileSync(resolve(REPOSITORY_ROOT, GRAPH_FILENAME), svg);
      console.info(
        `${GRAPH_FILENAME}: ${workspacePackages.length} packages, ${workspaceEdges.runtime.length} runtime and ${workspaceEdges.development.length} development edges`,
      );
    },
  }),
);
