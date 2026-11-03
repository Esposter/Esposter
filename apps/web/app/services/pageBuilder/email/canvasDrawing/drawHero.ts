import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNodeType } from "mjml-blocks";

import { drawContainer } from "@/services/pageBuilder/email/canvasDrawing/drawContainer";

// MJML writes a hero's height on the table cell that is its band, where it is the least the band is tall and its content
// Grows past it. Drawn as a block's height it would cut the band to the padding and let the words spill out below it, so
// The band keeps the height as a minimum
export const drawHero: EmailCanvasDrawing<MjmlNodeType.Hero> = (node, context) => {
  const { height, ...bandStyle } = context.style;
  return drawContainer(node, {
    ...context,
    style: { ...bandStyle, boxSizing: "border-box", ...(height === undefined ? {} : { minHeight: height }) },
  });
};
