import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

import { sanitizeHtml } from "@esposter/shared";

// A table is drawn as the rows it holds inside a table element, since a row parses only within one
export const drawTable: EmailCanvasDrawing<MjmlNodeType.Table> = (node, { style }) =>
  h("table", { innerHTML: sanitizeHtml(node.props.content), style });
