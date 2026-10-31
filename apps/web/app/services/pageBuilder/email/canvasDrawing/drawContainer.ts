import type { EmailCanvasContext } from "@/models/pageBuilder/EmailCanvasContext";
import type { MjmlNode } from "mjml-blocks";

// A container draws the children it holds, and a labelled box when it holds none, so the tree stays visible
export const drawContainer = (node: MjmlNode, { childNodes, style }: EmailCanvasContext): VNode =>
  h("div", { style }, childNodes.length > 0 ? childNodes : node.type);
