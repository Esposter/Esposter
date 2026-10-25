import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

import { h } from "vue";

// A navbar link is drawn inline as its words, so a navbar lays its links out in one row
export const drawNavbarLink: EmailCanvasDrawing<MjmlNodeType.NavbarLink> = (node, { style }) =>
  h("span", { style }, node.props.content);
