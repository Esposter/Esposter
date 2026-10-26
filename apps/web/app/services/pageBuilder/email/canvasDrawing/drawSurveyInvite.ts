import type { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";

// A survey invite is drawn as the link's label a reader clicks, the way a button is drawn as its words
export const drawSurveyInvite: EmailCanvasDrawing<EmailNodeType.SurveyInvite> = (node, { style }) =>
  h("div", { style }, node.props.label);
