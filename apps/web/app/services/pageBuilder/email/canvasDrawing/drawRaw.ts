import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

import { sanitizeHtml } from "@esposter/shared";
import { h } from "vue";

// A raw block is drawn as the HTML it holds, sanitised again at the draw so no unchecked markup is inserted
export const drawRaw: EmailCanvasDrawing<MjmlNodeType.Raw> = (node, { style }) =>
  h("div", { innerHTML: sanitizeHtml(node.props.content), style });
