import type { EmailCanvasContext } from "@/models/pageBuilder/EmailCanvasContext";
import type { MjmlNode } from "mjml-blocks";

// A leaf without a drawing of its own draws the attributes its component takes and is labelled with its type
export const drawLeaf = (node: MjmlNode, { style }: EmailCanvasContext): VNode => h("div", { style }, node.type);
