import type { BrightnessBandReading } from "#src/models/genshinParity/passes/BrightnessBandReading";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { computeBrightnessBands } from "#src/services/genshinParity/passes/computeBrightnessBands";
import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { shootScreen } from "#src/services/genshinParity/shared/shootScreen";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

// The pixels of the display frame inside the reference's scored region, the region scaled to the display width, or all
// of them where the reference names none
const getScoredMask = (
  region: ParityReference["region"],
  referenceWidth: number,
  displayHeight: number,
): Uint8Array => {
  if (!region) return new Uint8Array(DISPLAY_WIDTH * displayHeight).fill(1);
  const scale = DISPLAY_WIDTH / referenceWidth;
  return Uint8Array.from({ length: DISPLAY_WIDTH * displayHeight }, (_value, pixel) => {
    const column = pixel % DISPLAY_WIDTH;
    const row = Math.floor(pixel / DISPLAY_WIDTH);
    const isScored =
      column >= region.x * scale &&
      column < (region.x + region.width) * scale &&
      row >= region.y * scale &&
      row < (region.y + region.height) * scale;
    return isScored ? 1 : 0;
  });
};

// A reference's brightness bands with the bloom drawn off: our frame of its screen at the reference's own size, as
// `compare` shoots it (its props, variant and window), with `isBloomed` forced off, against the reference, both resized
// down to the display width by the same kernel, so neither side is read sharper. Its bands are read over the reference's
// scored region
export const readBrightnessBands = async (referenceId: string, pageRoot?: string): Promise<BrightnessBandReading[]> => {
  await fetchReferences();
  const reference = ParityReferenceMap[referenceId];
  if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
  const referencePath = await getReferencePath(referenceId);
  const { height, width } = await sharp(referencePath).metadata();
  const [shotPath = ""] = await shootScreen({
    height,
    pageRoot,
    pointer: reference.pointer,
    props: { ...reference.props, isBloomed: false },
    screen: reference.screen,
    variant: reference.variant,
    width,
    windowLeft: reference.windowLeft,
  });
  const displayHeight = Math.round((DISPLAY_WIDTH * height) / width);
  // A WebP reference is shrunk as it loads by default, so the reference is read at its own size first, as
  // `openWitnessPage` reads it, and the one resize below takes both sides down
  const image = await sharp(referencePath)
    .resize(width, height, { fastShrinkOnLoad: false })
    .removeAlpha()
    .png()
    .toBuffer();
  const [referenceRgb, oursRgb] = await Promise.all([
    readRawRgb(image, DISPLAY_WIDTH, displayHeight),
    readRawRgb(await readFile(shotPath), DISPLAY_WIDTH, displayHeight),
  ]);
  return computeBrightnessBands(
    referenceRgb,
    oursRgb,
    DISPLAY_WIDTH,
    displayHeight,
    getScoredMask(reference.region, width, displayHeight),
  );
};
