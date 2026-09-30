// A tree as text, one node a line indented by its depth, each line written by the tree's own formatter: the one printer
// The interface's RectTransform tree and a scene's Transform tree share
export const formatTree = <T extends { children: readonly T[] }>(
  node: T,
  formatLine: (node: T) => string,
  depth = 0,
): string =>
  [
    `${"  ".repeat(depth)}${formatLine(node)}`,
    ...node.children.map((child) => formatTree(child, formatLine, depth + 1)),
  ].join("\n");
