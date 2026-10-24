import type { MjmlColumnNode, MjmlNode } from "mjml-blocks";

import { MjmlNodeType } from "mjml-blocks";

// Whether an email node is a column, the node a section's width is set on
export const checkIsColumn = (node: MjmlNode): node is MjmlColumnNode => node.type === MjmlNodeType.Column;
