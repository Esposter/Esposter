import type { EmailCanvasContext } from "@/models/pageBuilder/EmailCanvasContext";
import type { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import type { MjmlNode, MjmlNodeType } from "mjml-blocks";
import type { VNode } from "vue";

// One email node type's drawing: the node narrowed to that type, and what the canvas reads around it
export type EmailCanvasDrawing<TType extends EmailCanvasType> = (
  node: Extract<MjmlNode, { type: TType }>,
  context: EmailCanvasContext,
) => VNode;

// Every type an email node carries: MJML's own, and the ones an email adds to that set
export type EmailCanvasType = EmailNodeType | MjmlNodeType;
