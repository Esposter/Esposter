import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";

// A text, or an accordion's text, is drawn as its sanitised note html, so its formatting shows as a reader sees it
export const drawText: EmailCanvasDrawing<MjmlNodeType.AccordionText | MjmlNodeType.Text> = (node, { style }) =>
  h("div", { innerHTML: renderNoteHtml(node.props.content), style });
