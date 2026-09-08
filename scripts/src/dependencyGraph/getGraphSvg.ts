import type { WorkspaceEdges } from "#src/dependencyGraph/models/WorkspaceEdges";
import type { WorkspacePackage } from "#src/models/WorkspacePackage";

import { getGraphSource } from "#src/dependencyGraph/getGraphSource";
import { getShadowedSvg } from "#src/dependencyGraph/getShadowedSvg";
import { Graphviz } from "@hpcc-js/wasm-graphviz";

// Graphviz proper, compiled to wasm — the layout is `dot`'s, so the svg is what the graphviz binary would emit
// Without anything having to be installed on the machine that runs this. The write and the freshness check both
// Come through here, so neither can drift into emitting bytes the other would not.
export const getGraphSvg = async (
  workspacePackages: WorkspacePackage[],
  workspaceEdges: WorkspaceEdges,
): Promise<string> => {
  const graphviz = await Graphviz.load();
  return getShadowedSvg(graphviz.dot(getGraphSource(workspacePackages, workspaceEdges)));
};
