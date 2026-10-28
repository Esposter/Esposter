import type { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import type { EmailCanvasContext } from "@/models/pageBuilder/EmailCanvasContext";
import type { MjmlNode, MjmlNodeType } from "mjml-blocks";
import type { VNode } from "vue";

// One email node type's drawing: the node narrowed to that type, and what the canvas reads around it
export type EmailCanvasDrawing<TType extends EmailCanvasType> = (
  node: EmailCanvasNodeMap[TType],
  context: EmailCanvasContext,
) => VNode;
// Every type an email node carries: MJML's own, and the ones an email adds to that set
export type EmailCanvasType = EmailNodeType | MjmlNodeType;
// Looked up by type rather than written as a conditional in the drawing: TypeScript compares two instances of one
// Generic alias by variance, and a conditional type measures as invariant there, so a drawing shared by two types (a
// Text and an accordion's text) would fail each of its keys
type EmailCanvasNodeMap = { [TType in EmailCanvasType]: Extract<MjmlNode, { type: TType }> };
