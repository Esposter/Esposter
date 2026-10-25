import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

import { h } from "vue";

// A button is drawn as the words a reader sees, so the canvas shows what the email says rather than a box
export const drawButton: EmailCanvasDrawing<MjmlNodeType.Button> = (node, { style }) =>
  h("div", { style }, node.props.content);
