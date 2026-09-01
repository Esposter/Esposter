export const GRAPH_FILENAME = "dependency-graph.svg";

export const WORKSPACE_SPECIFIER_PREFIX = "workspace:";
// The fields whose entries the package's shipped code needs, as opposed to `devDependencies`, which only its
// Build, lint, test and bench runs reach. Drawing the two apart is the whole point of this graph: every package
// Depends on `@esposter/configuration`, and reading that as a runtime edge inverts what the repo actually is.
export const RUNTIME_DEPENDENCY_FIELDS = ["dependencies", "optionalDependencies", "peerDependencies"] as const;
// Graphviz reads no stylesheet, so the theme is attribute defaults on the graph itself. `transparent` is what
// Lets the one committed svg sit in a README that is read in either colour scheme.
export const GRAPH_ATTRIBUTES = [
  'rankdir="LR"',
  'bgcolor="transparent"',
  'node [shape="box" style="filled" fillcolor="#f6f8fa" color="#8b949e" fontname="Helvetica" fontsize="11" margin="0.18,0.08"]',
  'edge [color="#8b949e" arrowsize="0.7"]',
] as const;

export const RUNTIME_EDGE_ATTRIBUTES = 'color="#3d7dd8"';

export const DEVELOPMENT_EDGE_ATTRIBUTES = 'style="dashed"';
