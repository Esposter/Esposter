import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

// A spacer is drawn as the gap its height names, with no label, since the gap is all it holds
export const drawSpacer: EmailCanvasDrawing<MjmlNodeType.Spacer> = (_node, { style }) => h("div", { style });
