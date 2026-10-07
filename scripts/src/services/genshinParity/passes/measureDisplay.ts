import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { solveToneContrast } from "#src/services/genshinParity/display/solveToneContrast";
import { DISPLAY_CONTRAST_GATE, DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { withFinalizerAsync } from "@esposter/shared";
import { GENSHIN_TONE_CONTRAST } from "genshin-engine";
import sharp from "sharp";

const TARGET_NAMES = [WitnessTargetName.Albedo, WitnessTargetName.Depth, WitnessTargetName.Part];
// A pixel is read where little haze lies over it, its albedo dark in no channel and its colour shown clear of black and
// White in every one, where the curve and the encoding still tell one light from the next
const MAX_DEPTH = 80;
const MIN_ALBEDO = 0.02;
const MIN_DISPLAY = 0.01;
const MAX_DISPLAY = 0.95;
// The display pass: at each current build's reference's camera (`solveReferenceCamera`), every interior pixel of the
// Exports' parts, its albedo beside the reference's colour there, and the tone curve's contrast its light lies flattest
// Under (`solveToneContrast`). Its reading is how much more the shipped contrast leaves than that one, gated where the
// Profile's other values stand well apart. The curve's exposure only scales the light the light pass solves, so no
// Reference measures it
export const measureDisplay = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  await fetchReferences();
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { browser, checkIsScored, height, image, page } = await openWitnessPage(
      referenceId,
      component,
      DISPLAY_WIDTH,
    );
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { targets, width } = await withFinalizerAsync(
      async () => {
        const { pose } = await solveReferenceCamera(page, referenceId, component);
        await setPageWitnessView(page, { camera: toPageCamera(pose), isAlone: true });
        return readWitnessTargets(page, TARGET_NAMES);
      },
      () => browser.close(),
    );
    const { albedo = new Float32Array(), depth = new Float32Array(), part = new Float32Array() } = targets;
    // oxlint-disable-next-line no-await-in-loop -- each reference's shot is read in turn
    const shot = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
    const samples: DisplaySample[] = [];
    for (let pixel = 0; pixel < width * height; pixel++) {
      if (!checkIsPartInterior(part, width, height, pixel) || !checkIsScored(pixel, width)) continue;
      if ((depth[pixel * 4] ?? 0) > MAX_DEPTH) continue;
      const [red = 0, green = 0, blue = 0] = CHANNELS.map((channel) => albedo[pixel * 4 + channel] ?? 0);
      const [shownRed, shownGreen, shownBlue] = getPixelDisplayColor(shot, pixel);
      if (Math.min(red, green, blue) < MIN_ALBEDO) continue;
      if (
        Math.min(shownRed, shownGreen, shownBlue) < MIN_DISPLAY ||
        Math.max(shownRed, shownGreen, shownBlue) > MAX_DISPLAY
      )
        continue;
      samples.push({ albedo: [red, green, blue], display: [shownRed, shownGreen, shownBlue] });
    }
    // oxlint-disable-next-line no-await-in-loop -- each reference's solve is read in turn
    const { contrast, residual } = await solveToneContrast(samples);
    const shippedResidual = computeLightPlaneResidual(samples, GENSHIN_TONE_CONTRAST);
    measures.push({
      notes: [
        `${referenceId}: ${samples.length} pixels lie flattest at contrast ${contrast.toFixed(3)}, residual ${residual.toExponential(3)}; the shipped ${GENSHIN_TONE_CONTRAST} leaves ${shippedResidual.toExponential(3)}`,
      ],
      readings: [
        {
          gate: DISPLAY_CONTRAST_GATE,
          name: `${referenceId} contrast's excess`,
          unit: "share",
          value: residual === 0 ? 0 : (shippedResidual - residual) / residual,
        },
      ],
    });
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
