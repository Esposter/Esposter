import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

// A divider is drawn as the rule its border attributes name, since a rule is what it is
export const drawDivider: EmailCanvasDrawing<MjmlNodeType.Divider> = (_node, { attribute, style }) =>
  h("div", {
    style: {
      ...style,
      borderTop: `${attribute("border-width")} ${attribute("border-style")} ${attribute("border-color")}`,
    },
  });
