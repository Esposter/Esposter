import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

// A label is drawn as the words a reader sees, so the canvas shows what the email says rather than a box
export const drawLabel: EmailCanvasDrawing<MjmlNodeType.AccordionTitle | MjmlNodeType.Button> = (node, { style }) =>
  h("div", { style }, node.props.content);
