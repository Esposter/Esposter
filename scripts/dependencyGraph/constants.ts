/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation these three template literals would otherwise infer */
import { DependencyField } from "#scripts/models/DependencyField";

export const GRAPH_FILENAME = "dependency-graph.svg";

export const WORKSPACE_SPECIFIER_PREFIX = "workspace:";
// The fields whose entries the package's shipped code needs, as opposed to `devDependencies`, which only its
// Build, lint, test and bench runs reach. Drawing the two apart is the whole point of this graph: every package
// Depends on `@esposter/configuration`, and reading that as a runtime edge inverts what the repo actually is.
export const RUNTIME_DEPENDENCY_FIELDS: DependencyField[] = [
  DependencyField.Dependencies,
  DependencyField.OptionalDependencies,
  DependencyField.PeerDependencies,
];
// The one neutral in the palette. It is the grey that carries against both a white and a near-black page, which
// Is what every line the theme does not own has to do — the svg is committed once and read in either scheme.
export const MUTED_COLOR = "#8b949e";

export const RUNTIME_EDGE_COLOR = "#2f74d0";
// Graphviz reads no stylesheet, so the theme is attribute defaults on the graph itself. `transparent` is what
// Lets the one committed svg sit in a README that is read in either colour scheme, and it is also why every
// Colour here is one that carries its own contrast: a node is an opaque pale fill with near-black text on top
// Of it rather than a colour that only works over white.
export const GRAPH_ATTRIBUTES: string[] = [
  'rankdir="LR"',
  'bgcolor="transparent"',
  'splines="spline"',
  'nodesep="0.34"',
  'ranksep="0.92"',
  'pad="0.34"',
  'fontname="Helvetica"',
  'fontsize="12"',
  `fontcolor="${MUTED_COLOR}"`,
  'labelloc="b"',
  'labeljust="l"',
  // `gradientangle` is what turns a two-stop `fillcolor` into a lit face: 270 runs the pale stop along the top
  // Edge and the deeper one along the bottom, which is the direction the `box3d` fold already implies.
  `node [shape="box3d" style="filled" gradientangle="270" fontname="Helvetica" fontsize="13" fontcolor="#161b22" margin="0.28,0.14" penwidth="1.6"]`,
  'edge [arrowhead="normal"]',
];
// The one cluster the graph draws. Every node in it lives under `packages/`, so the cluster is that directory
// Rather than a grouping invented for the picture, and the label is the directory's own name.
export const CLUSTER_ATTRIBUTES: string[] = [
  'style="rounded"',
  // The graph's `labelloc` is inherited, and the graph puts its legend at the bottom.
  'labelloc="t"',
  `color="${MUTED_COLOR}"`,
  'penwidth="2"',
  'fontname="Helvetica"',
  'fontsize="16"',
  `fontcolor="${MUTED_COLOR}"`,
  'labeljust="l"',
  'margin="18"',
];
// A runtime edge outweighs a development one eightfold so the layout is ranked by what the repo ships: the
// Development edges all converge on `configuration` and would otherwise pull the ranks around to suit a
// Relationship that only a build has.
export const RUNTIME_EDGE_ATTRIBUTES: string = `color="${RUNTIME_EDGE_COLOR}" penwidth="2.2" arrowsize="1" weight="8"`;
// Alpha rather than a paler grey, so the dashes stay the same hue as the cluster they sit in and recede on
// Either background instead of only on white.
export const DEVELOPMENT_EDGE_ATTRIBUTES: string = `style="dashed" color="${MUTED_COLOR}99" penwidth="1.2" arrowsize="0.72" weight="1"`;
// The svg graphviz emits opens every node with this, and nothing else in the document does — the cluster is
// `<g id="clust`, an edge `<g id="edge`.
export const NODE_GROUP_PREFIX = '<g id="node';

export const NODE_SHADOW_ID = "nodeShadow";
// The region is grown well past the box because a drop shadow is drawn outside the shape's own bounds, and the
// Default filter region would clip it.
export const NODE_SHADOW_DEFINITION: string = `<defs><filter id="${NODE_SHADOW_ID}" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="2.5" dy="3" stdDeviation="2.4" flood-color="#0b1622" flood-opacity="0.26"/></filter></defs>`;
