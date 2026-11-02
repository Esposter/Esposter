import type { SrgbColor } from "#shared/models/pageBuilder/SrgbColor";
import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";

import { getCanvasSrgbColor } from "@/services/pageBuilder/getCanvasSrgbColor";
import { parseRgbColor } from "@/services/pageBuilder/parseRgbColor";

// The sRGB channels a colour value is drawn in, read off a probe element the browser computes the value on, so every
// Syntax the style panel takes is read by the browser that draws it. A value the browser refuses reads as nothing
export const readBrowserColor = (value: StyleValue): SrgbColor | undefined => {
  const probe = window.document.createElement("span");
  probe.style.color = value;
  // A value the browser refuses leaves the probe's colour unset, which is nothing to read
  if (!probe.style.color) return undefined;

  // The computed value exists only while the probe is in the document, so it is read before the probe leaves
  window.document.body.append(probe);
  const computedColor = window.getComputedStyle(probe).color;
  probe.remove();
  return parseRgbColor(computedColor) ?? getCanvasSrgbColor(computedColor);
};
