import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

// The style a node sets, or nothing for a node whose type holds no style
export const getNodeStyle = (node: WebpageNode): NodeStyle | undefined =>
  "style" in node.props ? node.props.style : undefined;
