import type { SrgbColor } from "#shared/models/shared/SrgbColor";

import { MAX_COLOR_CHANNEL } from "@/services/shared/constants";
import { takeOne } from "@esposter/shared";

// The sRGB channels of a colour the browser computes in a space other than rgb, read off a one-pixel canvas it is drawn
// On: the browser converts it to sRGB there. A translucent colour reads as nothing, as it does in rgb
export const getCanvasSrgbColor = (computedColor: string): SrgbColor | undefined => {
  const context = window.document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;

  context.fillStyle = computedColor;
  context.fillRect(0, 0, 1, 1);
  const channels = [...context.getImageData(0, 0, 1, 1).data];
  if (takeOne(channels, 3) !== MAX_COLOR_CHANNEL) return undefined;

  return [
    takeOne(channels, 0) / MAX_COLOR_CHANNEL,
    takeOne(channels, 1) / MAX_COLOR_CHANNEL,
    takeOne(channels, 2) / MAX_COLOR_CHANNEL,
  ];
};
