import type { BlockNode } from "headless-block-editor";

import { z } from "zod";

// The class a styled node carries, named from its id, so its rules reach that node alone
export const getNodeStyleClass = (node: BlockNode): string => `pb-${z.string().parse(node.props.id)}`;
