import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { BloomBaseline } from "#src/models/genshinParity/passes/BloomBaseline";
import type { GameBloomStructure } from "genshin-engine";

import { BloomResize } from "#src/models/genshinParity/passes/BloomResize";
import { BLOOM_RESIZE, DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { readOurFrame } from "#src/services/genshinParity/passes/readOurFrame";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GENSHIN_BLOOM_STRUCTURE } from "genshin-engine";
import sharp from "sharp";

// The width a reference's frames are drawn at: the display width, or the reference's own width, which both sides are
// Then Resized down from by the same kernel
export const getBloomPageWidth = (resize: BloomResize, referenceWidth: number): number =>
  resize === BloomResize.Display ? DISPLAY_WIDTH : referenceWidth;

const getPageWidth = async (referenceId: string, resize: BloomResize): Promise<number> => {
  const { width } = await sharp(await getReferencePath(referenceId)).metadata();
  if (!width) throw new InvalidOperationError(Operation.Read, referenceId, "has no width to draw its frames at");
  return getBloomPageWidth(resize, width);
};

// The frame of a reference's screen without the bloom, and the reference at the display width: the two sides every
// Structure of the bloom is read against. Both go through one resize under `source`, so neither side is read sharper
export const readBloomBaseline = async (
  referenceId: string,
  component: DerivedAssetComponent,
  resize: BloomResize,
  pageRoot?: string,
): Promise<BloomBaseline> => {
  const pageWidth = await getPageWidth(referenceId, resize);
  const { frame, height, image } = await readOurFrame(
    referenceId,
    component,
    { isBloomed: false },
    pageRoot,
    pageWidth,
  );
  return { height, reference: await readRawRgb(image, DISPLAY_WIDTH, height), unbloomed: frame };
};

// Our frame of a reference's screen with the game's bloom drawn in the given structure, at the same width the baseline
// Is
export const readBloomedFrame = async (
  referenceId: string,
  component: DerivedAssetComponent,
  resize: BloomResize,
  structure: GameBloomStructure,
  pageRoot?: string,
): Promise<Buffer> => {
  const pageWidth = await getPageWidth(referenceId, resize);
  const { frame } = await readOurFrame(
    referenceId,
    component,
    { bloomStructure: structure, isBloomed: undefined },
    pageRoot,
    pageWidth,
  );
  return frame;
};

// The bloom's two frames of a reference at the display width, drawn with the engine's own structure and the pass's
// Measure (`BLOOM_RESIZE`): ours with the game's bloom drawn and with it off, the one prop the bloom reading varies,
// And the Reference's own pixels at the same size
export const readBloomFrames = async (
  referenceId: string,
  component: DerivedAssetComponent,
  pageRoot?: string,
): Promise<{ bloomed: Buffer; height: number; reference: Buffer; unbloomed: Buffer }> => {
  const baseline = await readBloomBaseline(referenceId, component, BLOOM_RESIZE, pageRoot);
  const bloomed = await readBloomedFrame(referenceId, component, BLOOM_RESIZE, GENSHIN_BLOOM_STRUCTURE, pageRoot);
  return { bloomed, height: baseline.height, reference: baseline.reference, unbloomed: baseline.unbloomed };
};
