import type { EmailCanvasDrawing } from "#src/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

// A navbar link is drawn inline as its words, so a navbar lays its links out in one row
export const drawNavbarLink: EmailCanvasDrawing<typeof MjmlNodeType.NavbarLink> = (node, { style }) =>
  h("span", { style }, node.props.content);
