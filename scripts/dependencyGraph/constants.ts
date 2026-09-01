export const GRAPH_FILENAME = "dependency-graph.svg";

export const WORKSPACE_SPECIFIER_PREFIX = "workspace:";
// The fields whose entries the package's shipped code needs, as opposed to `devDependencies`, which only its
// Build, lint, test and bench runs reach. Drawing the two apart is the whole point of this graph: every package
// Depends on `@esposter/configuration`, and reading that as a runtime edge inverts what the repo actually is.
export const RUNTIME_DEPENDENCY_FIELDS = ["dependencies", "optionalDependencies", "peerDependencies"] as const;
// Graphviz reads no stylesheet, so the theme is attribute defaults on the graph itself. `transparent` is what
// Lets the one committed svg sit in a README that is read in either colour scheme, and it is also why every
// Colour here is one that carries its own contrast: a node is a pale fill with black text on top of it rather
// Than a colour that only works over white.
export const GRAPH_ATTRIBUTES = [
  'rankdir="LR"',
  'bgcolor="transparent"',
  'node [shape="box3d" style="filled" fillcolor="#ffffcc" color="#8b949e" fontname="Helvetica" fontsize="13" margin="0.26,0.13" penwidth="1.4"]',
  'edge [color="#8b949e" arrowsize="0.9" penwidth="2"]',
] as const;
// The one cluster the graph draws. Every node in it lives under `packages/`, so the cluster is that directory
// Rather than a grouping invented for the picture, and the label is the directory's own name.
export const CLUSTER_ATTRIBUTES = [
  'style="rounded"',
  'color="#8b949e"',
  'penwidth="2"',
  'fontname="Helvetica"',
  'fontsize="16"',
  'fontcolor="#8b949e"',
  'labeljust="l"',
  'margin="18"',
] as const;

export const RUNTIME_EDGE_ATTRIBUTES = 'color="#3d7dd8"';

export const DEVELOPMENT_EDGE_ATTRIBUTES = 'style="dashed"';
