import { InvalidOperationError, Operation } from "@esposter/shared";
import sharp from "sharp";

// Alpha under which a pixel is paper rather than the mark's ink, so a cell's colour is its ink's alone
const INK_ALPHA = 32;
const toHex = (channels: number[]): string =>
  `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
// A ring mark's colours, sampled about the image's centre in both dimensions: `bands` rings from the ink's inner edge to
// Its outer, or to the circle the image's square holds where the ink runs on into its corners, each cut into `angles` cells clockwise from the top, and each cell the mean of the ink inside it, weighted
// By its alpha. A cell with no ink (a gap between the mark's strokes) takes its nearest inked neighbour along its angle,
// So drawing the bands blended into each other carries no paper into the strokes. One band a line: its middle radius
// As a share of the image's half width, then its colours
export const samplePolar = async (path: string, bands: number, angles: number): Promise<void> => {
  // A count that is not a whole number past zero sizes no cell, and the rows would print with no colours at all
  if (![bands, angles].every((count) => Number.isSafeInteger(count) && count > 0))
    throw new InvalidOperationError(Operation.Read, samplePolar.name, "bands and angles must be positive integers");
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { channels, height, width } = info;
  const centreX = width / 2;
  const centreY = height / 2;
  const halfSize = Math.min(width, height) / 2;
  let innerRadius = Infinity;
  let outerRadius = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if ((data[(y * width + x) * channels + 3] ?? 0) < INK_ALPHA) continue;
      const radius = Math.hypot(x + 0.5 - centreX, y + 0.5 - centreY);
      innerRadius = Math.min(innerRadius, radius);
      outerRadius = Math.max(outerRadius, radius);
    }
  const bandWidth = (Math.min(outerRadius, halfSize) - innerRadius) / bands;
  const sums = Array.from({ length: bands * angles }, () => ({ alpha: 0, blue: 0, green: 0, red: 0 }));
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * channels;
      const alpha = data[offset + 3] ?? 0;
      if (alpha < INK_ALPHA) continue;
      const dx = x + 0.5 - centreX;
      const dy = y + 0.5 - centreY;
      const band = Math.floor((Math.hypot(dx, dy) - innerRadius) / bandWidth);
      if (band >= bands) continue;
      // Clockwise from the top, as a conic gradient runs, each cell centred on its angle
      const turn = (Math.atan2(dx, -dy) / (2 * Math.PI) + 1 + 0.5 / angles) % 1;
      const sum = sums[band * angles + Math.floor(turn * angles)];
      if (!sum) continue;
      sum.alpha += alpha;
      sum.red += (data[offset] ?? 0) * alpha;
      sum.green += (data[offset + 1] ?? 0) * alpha;
      sum.blue += (data[offset + 2] ?? 0) * alpha;
    }
  const cellColors = sums.map(({ alpha, blue, green, red }) =>
    alpha > 0 ? toHex([red / alpha, green / alpha, blue / alpha]) : "",
  );
  for (let band = 0; band < bands; band++) {
    const colors = Array.from({ length: angles }, (_, angle) => {
      for (let distance = 0; distance < bands; distance++)
        for (const neighbour of [band - distance, band + distance]) {
          const color = neighbour >= 0 && neighbour < bands ? cellColors[neighbour * angles + angle] : "";
          if (color) return color;
        }
      return "";
    });
    const radiusShare = (innerRadius + (band + 0.5) * bandWidth) / halfSize;
    console.log(`${radiusShare.toFixed(4)} ${colors.join(" ")}`);
  }
};
