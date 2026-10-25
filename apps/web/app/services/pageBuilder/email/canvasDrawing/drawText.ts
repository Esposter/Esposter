import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { h } from "vue";

// A text is drawn as its sanitised note html, so its formatting shows as the reader will see it
export const drawText: EmailCanvasDrawing<MjmlNodeType.Text> = (node, { style }) =>
  h("div", { innerHTML: renderNoteHtml(node.props.content), style });
