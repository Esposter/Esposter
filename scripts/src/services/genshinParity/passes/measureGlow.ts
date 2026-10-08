import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyColour } from "#src/services/genshinParity/passes/compareFamilyColour";
import { COLOUR_GATE, FRAME_GATE_PIXELS, SHAPE_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";
import { shiftTargetAcross } from "#src/services/genshinParity/passes/shiftTargetAcross";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { shootWitnessFamilies } from "#src/services/genshinParity/witness/shootWitnessFamilies";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";

// A shot's pixels as linear colours in a four-float target, which `compareFamilyColour` reads as it reads a surface's
const toColourTarget = (shot: Buffer, pixelCount: number): Float32Array => {
  const colour = new Float32Array(pixelCount * 4);
  for (let pixel = 0; pixel < pixelCount; pixel++) colour.set(getPixelDisplayColor(shot, pixel), pixel * 4);
  return colour;
};
// The glow, read where the light pass reads the frame: at each current build's reference under the scene's pose for it,
// The pixels of each family the exports' materials add a glow over their lit colour to (their emission, cut where the
// Stone program cuts it), the reference's frame there against the frame our stand-in lights under the same camera. Each
// Family's glow is held to where two colours side by side are just told apart, and its structure to the frame's own
// Softness, the reference moved across by the frame's gate, as a surface's structure is gated at its outline's
export const measureGlow = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  await fetchReferences();
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { close, checkIsScored, height, image, page } = await openWitnessPage(referenceId, component, SHAPE_WIDTH);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const measure = await withFinalizerAsync(
      async () => {
        const { pose } = await solveReferenceCamera(page, referenceId, component);
        await setPageWitnessView(page, { camera: toPageCamera(pose), isAlone: true });
        const {
          families,
          targets: { emission = new Float32Array(), part = new Float32Array() },
          width,
        } = await readWitnessTargets(page, [WitnessTargetName.Emission, WitnessTargetName.Part]);
        // The stand-in as the scene lights it, its exports hidden, under the same camera
        const oursShot = await shootWitnessFamilies(page, [], { height, width });
        const referenceShot = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
        const oursFrame = await sharp(oursShot).removeAlpha().raw().toBuffer();
        const pixelCount = width * height;
        const glowPart = new Float32Array(part.length);
        for (let pixel = 0; pixel < pixelCount; pixel++) {
          const family = readTargetFamily(part, pixel);
          const isGlowing = [0, 1, 2].some((channel) => (emission[pixel * 4 + channel] ?? 0) > 0);
          if (family >= 0 && isGlowing && checkIsScored(pixel, width)) glowPart.set([1, family, 0, 1], pixel * 4);
        }
        const referenceColour = toColourTarget(referenceShot, pixelCount);
        const gate = compareFamilyColour(
          { colour: referenceColour, part: glowPart },
          {
            colour: shiftTargetAcross(referenceColour, width, FRAME_GATE_PIXELS),
            part: shiftTargetAcross(glowPart, width, FRAME_GATE_PIXELS),
          },
          width,
          families.length,
        );
        const familyGateMap = new Map(
          gate.comparisons.map((comparison) => [
            comparison.family,
            Number.isFinite(comparison.structure) ? comparison.structure : 0,
          ]),
        );
        const glow = compareFamilyColour(
          { colour: referenceColour, part: glowPart },
          { colour: toColourTarget(oursFrame, pixelCount), part: glowPart },
          width,
          families.length,
        );
        return {
          notes: glow.comparisons.map(
            ({ family, scales }) =>
              `${referenceId} ${families[family] ?? family} glow structure by scale, finest first: ${scales.map((scale) => scale.toFixed(3)).join(" ")}`,
          ),
          readings: glow.comparisons.flatMap(({ colour, family, structure }) => {
            const name = `${referenceId} ${families[family] ?? family}`;
            return [
              { gate: COLOUR_GATE, name: `${name} glow colour`, unit: "ΔE", value: colour },
              { gate: familyGateMap.get(family) ?? 0, name: `${name} glow structure`, unit: "share", value: structure },
            ];
          }),
        };
      },
      () => close(),
    );
    measures.push(measure);
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
