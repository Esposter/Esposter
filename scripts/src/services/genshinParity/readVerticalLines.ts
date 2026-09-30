import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { readEdgeThreshold } from "#src/services/genshinParity/readEdgeThreshold";
import { readSobelGradients } from "#src/services/genshinParity/readSobelGradients";

// An edge runs vertically where its gradient across x is at least this many times its gradient along y
const VERTICAL_GRADIENT_RATIO = 2;
// The shortest run of vertical edge a line is, as a share of the image's height: a tower's side runs far longer, and
// A cloud's rim almost never runs this far straight up
const LINE_HEIGHT_SHARE = 0.15;
// A tower's side is broken every few rows by its mouldings and paled by haze, so a line bridges a gap of this many rows
// And is read from the strongest fifth of the image's gradients
const LINE_GAP = 4;
const LINE_EDGE_SHARE = 0.2;
// The long vertical lines of an image at the structure's width and the height given, as a mask of their pixels: the
// Sides of a scene's towers and pillars, which its clouds, drawn as soft billows, do not have. A run may wander a pixel
// Either side from one row to the next
export const readVerticalLines = async (input: Buffer, height: number): Promise<Uint8Array> => {
  const { magnitudes, xGradients, yGradients } = await readSobelGradients(input, height);
  const threshold = readEdgeThreshold(magnitudes, LINE_EDGE_SHARE);
  // An edge is thinned to its crest across x, so a line is one pixel wide and a curve leaves any one column quickly
  const isVertical = Uint8Array.from(magnitudes, (magnitude, index) => {
    const across = Math.abs(xGradients[index] ?? 0);
    const x = index % STRUCTURE_WIDTH;
    const isCrest =
      (x === 0 || across >= Math.abs(xGradients[index - 1] ?? 0)) &&
      (x === STRUCTURE_WIDTH - 1 || across > Math.abs(xGradients[index + 1] ?? 0));
    return magnitude >= threshold && isCrest && across >= VERTICAL_GRADIENT_RATIO * Math.abs(yGradients[index] ?? 0)
      ? 1
      : 0;
  });
  const checkIsNear = (x: number, y: number): boolean => {
    for (let dx = -1; dx <= 1; dx++)
      if (x + dx >= 0 && x + dx < STRUCTURE_WIDTH && isVertical[y * STRUCTURE_WIDTH + x + dx]) return true;
    return false;
  };
  const minimumLength = Math.round(height * LINE_HEIGHT_SHARE);
  const lines = new Uint8Array(isVertical.length);
  for (let x = 0; x < STRUCTURE_WIDTH; x++) {
    let runStart = -1;
    let lastNear = -1;
    for (let y = 0; y <= height; y++) {
      if (y < height && checkIsNear(x, y)) {
        if (runStart === -1) runStart = y;
        lastNear = y;
        continue;
      }
      if (runStart === -1 || (y < height && y - lastNear <= LINE_GAP)) continue;
      if (lastNear + 1 - runStart >= minimumLength)
        for (let runY = runStart; runY <= lastNear; runY++)
          if (isVertical[runY * STRUCTURE_WIDTH + x]) lines[runY * STRUCTURE_WIDTH + x] = 1;
      runStart = -1;
    }
  }
  return lines;
};
