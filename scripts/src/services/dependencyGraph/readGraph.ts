import type { Graph } from "#src/models/dependencyGraph/Graph";

import { getGraphSvg } from "#src/services/dependencyGraph/getGraphSvg";
import { getWorkspaceEdges } from "#src/services/dependencyGraph/getWorkspaceEdges";
import { readPnpmProjects } from "#src/services/dependencyGraph/readPnpmProjects";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";

// The graph the workspace draws today, with the packages and edges it was drawn from
export const readGraph = async (): Promise<Graph> => {
  const workspacePackages = readWorkspacePackages(REPOSITORY_ROOT);
  const workspaceEdges = getWorkspaceEdges(workspacePackages, readPnpmProjects());
  return { svg: await getGraphSvg(workspacePackages, workspaceEdges), workspaceEdges, workspacePackages };
};
