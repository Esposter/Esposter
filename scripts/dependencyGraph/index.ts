import { GRAPH_FILENAME } from "#scripts/dependencyGraph/constants";
import { getGraphSource } from "#scripts/dependencyGraph/getGraphSource";
import { getWorkspaceEdges } from "#scripts/dependencyGraph/getWorkspaceEdges";
import { getWorkspacePackages } from "#scripts/services/getWorkspacePackages";
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const workspacePackages = getWorkspacePackages(root);
const workspaceEdges = getWorkspaceEdges(workspacePackages);
const graphSource = getGraphSource(workspacePackages, workspaceEdges);
// Graphviz proper, compiled to wasm — the layout is `dot`'s, so the svg is what the graphviz binary would emit
// Without anything having to be installed on the machine that runs this.
const graphviz = await Graphviz.load();
const svg = graphviz.dot(graphSource);

writeFileSync(resolve(root, GRAPH_FILENAME), svg);
console.info(
  `${GRAPH_FILENAME}: ${String(workspacePackages.length)} packages, ${String(workspaceEdges.runtime.length)} runtime and ${String(workspaceEdges.development.length)} development edges`,
);
