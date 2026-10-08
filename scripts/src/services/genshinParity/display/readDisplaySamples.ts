import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";

const TARGET_NAMES = [WitnessTargetName.Albedo, WitnessTargetName.Depth, WitnessTargetName.Part];
// A pixel is read where little haze lies over it, its albedo dark in no channel and its colour shown short of white in
// Every one, where the curve and the encoding still tell one light from the next
const MAX_DEPTH = 80;
const MIN_ALBEDO = 0.02;
const MAX_DISPLAY = 0.95;
// At a reference's camera (`solveReferenceCamera`), every interior pixel of the exports' parts, its albedo beside the
// Reference's colour there, each channel shown above the least given: just over the curve's black where the light
// Under it is read, or over none where what takes a channel under the black is
export const readDisplaySamples = async (
  referenceId: string,
  component: DerivedAssetComponent,
  minDisplay: number,
): Promise<DisplaySample[]> => {
  const { close, checkIsScored, height, image, page } = await openWitnessPage(referenceId, component, DISPLAY_WIDTH);
  const { targets, width } = await withFinalizerAsync(
    async () => {
      const { pose } = await solveReferenceCamera(page, referenceId, component);
      await setPageWitnessView(page, { camera: toPageCamera(pose), isAlone: true });
      return readWitnessTargets(page, TARGET_NAMES);
    },
    () => close(),
  );
  const { albedo = new Float32Array(), depth = new Float32Array(), part = new Float32Array() } = targets;
  const shot = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const samples: DisplaySample[] = [];
  for (let pixel = 0; pixel < width * height; pixel++) {
    if (!checkIsPartInterior(part, width, height, pixel) || !checkIsScored(pixel, width)) continue;
    if ((depth[pixel * 4] ?? 0) > MAX_DEPTH) continue;
    const [red = 0, green = 0, blue = 0] = CHANNELS.map((channel) => albedo[pixel * 4 + channel] ?? 0);
    const [shownRed, shownGreen, shownBlue] = getPixelDisplayColor(shot, pixel);
    if (Math.min(red, green, blue) < MIN_ALBEDO) continue;
    if (
      Math.min(shownRed, shownGreen, shownBlue) <= minDisplay ||
      Math.max(shownRed, shownGreen, shownBlue) > MAX_DISPLAY
    )
      continue;
    samples.push({ albedo: [red, green, blue], display: [shownRed, shownGreen, shownBlue] });
  }
  return samples;
};
