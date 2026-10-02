import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { CLOUD_BRIGHTNESS_RATIO, SKY_LAYER } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readFlipErrorMap } from "#src/services/genshinParity/readFlipErrorMap";
import { readWitnessGbuffer } from "#src/services/genshinParity/readWitnessGbuffer";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { shootWitnessFamilies } from "#src/services/genshinParity/shootWitnessFamilies";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";

// The depths a part's pixels are split by, near, middle and far, where the light, then the haze, decides their colour
const DEPTH_BANDS: [string, number][] = [
  ["near", 20],
  ["middle", 80],
  ["far", Infinity],
];
// The sky's rows split into this many bands from the frame's top down, the zenith apart from the horizon's glow, and each
// Band's pixels into the clouds the reference shows over ours and the rest
const SKY_BAND_COUNT = 3;
// A part's face is lit where its cosine to the light passes this, turned away under its negative, and edge-on between
const FACING_COSINE = 0.3;
const BYTE = 255;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
type SetLights = (shares: { ambientShare?: number; sunShare?: number }) => { direction: [number, number, number] };
// Every term of a reference's error ranked by its ceiling, the most of the frame's FLIP that term drawn exactly would
// Recover: the frame's FLIP is its pixels' mean, so a term's ceiling is its pixels' error summed over the frame's
// Pixels. Each family of parts the witness draws splits into its stand-in, the error ours carries over the game's own
// Exports on that family's pixels, and the shared terms the exports carry too (the light, the haze, the grade), split
// By depth and by how the faces turn to the light, over the parts' interiors; the silhouettes are their own terms, the
// Exports' placement and the camera's pose, and the stand-ins' outlines over theirs; the sky splits by its rows and into the clouds the reference shows
// Over ours and the rest. One page draws the witness's layers and two shots, ours and the exports', and
// The error is mapped once over each, inside the reference's scored region
export const rankReferenceGains = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ frame: number; terms: { ceiling: number; name: string; share: number }[] }> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const familyList = (await page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
      const families = familyList.split(",").filter(Boolean);
      await setPageWitnessView(page, { families });
      const { direction } = await page.evaluate(
        () => (Reflect.get(window, "setSceneLights") as SetLights)({}),
        undefined,
      );
      const { depth, families: layerFamilies, normal, part, width } = await readWitnessGbuffer(page);
      const size = { height, width };
      const ourShot = await shootWitnessFamilies(page, [], size);
      const exportsShot = await shootWitnessFamilies(page, families, size);
      const [{ errorMap: witnessErrors }, { errorMap: ourErrors }] = [
        await readFlipErrorMap(image, exportsShot, width, height),
        await readFlipErrorMap(image, ourShot, width, height),
      ];
      const readLuminances = async (shot: Buffer): Promise<Float32Array> => {
        const data = await sharp(shot).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
        return Float32Array.from({ length: width * height }, (_, pixel) =>
          LUMINANCE.reduce(
            (sum, weight, channel) => sum + weight * toLinear((data[pixel * 3 + channel] ?? 0) / BYTE),
            0,
          ),
        );
      };
      const [referenceLuminances, ourLuminances] = [await readLuminances(image), await readLuminances(ourShot)];
      const termMap = new Map<string, { count: number; error: number }>();
      const add = (name: string, error: number): void => {
        const term = termMap.get(name) ?? { count: 0, error: 0 };
        term.count++;
        term.error += error;
        termMap.set(name, term);
      };
      let scoredCount = 0;
      let frameError = 0;
      // A pixel on a silhouette, the sky's or a part's, where a part or a pose a pixel off reads what stands beside it:
      // Its error is the exports' placement and the camera's pose, whatever the light
      const checkIsSilhouette = (pixel: number): boolean => {
        const [column, row] = [pixel % width, Math.floor(pixel / width)];
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++)
          for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
            const [neighbourColumn, neighbourRow] = [column + columnOffset, row + rowOffset];
            if (neighbourColumn < 0 || neighbourRow < 0 || neighbourColumn >= width || neighbourRow >= height) continue;
            if (part[(neighbourRow * width + neighbourColumn) * 4] !== part[pixel * 4]) return true;
          }
        return false;
      };
      for (let pixel = 0; pixel < width * height; pixel++) {
        if (!checkIsScored(pixel, width)) continue;
        scoredCount++;
        const ourError = ourErrors[pixel] ?? 0;
        frameError += ourError;
        if (checkIsSilhouette(pixel)) {
          add("silhouettes: placement and pose", witnessErrors[pixel] ?? 0);
          add("silhouettes: stand-ins", ourError - (witnessErrors[pixel] ?? 0));
          continue;
        }
        if (part[pixel * 4] === 0) {
          const band = Math.min(Math.floor((Math.floor(pixel / width) / height) * SKY_BAND_COUNT), SKY_BAND_COUNT - 1);
          const isCloud = (referenceLuminances[pixel] ?? 0) > (ourLuminances[pixel] ?? 0) * CLOUD_BRIGHTNESS_RATIO;
          add(
            `${SKY_LAYER}, band ${band + 1} of ${SKY_BAND_COUNT} from the top, ${isCloud ? "the reference's clouds" : "clear"}`,
            ourError,
          );
          continue;
        }
        const family = layerFamilies[part[pixel * 4 + 1] ?? 0] ?? "unnamed";
        const witnessError = witnessErrors[pixel] ?? 0;
        add(`${family}: stand-in`, ourError - witnessError);
        const [band = "far"] = DEPTH_BANDS.find(([, far]) => (depth[pixel * 4] ?? 0) < far) ?? [];
        const cosine =
          (normal[pixel * 4] ?? 0) * direction[0] +
          (normal[pixel * 4 + 1] ?? 0) * direction[1] +
          (normal[pixel * 4 + 2] ?? 0) * direction[2];
        const facing = cosine > FACING_COSINE ? "lit" : cosine < -FACING_COSINE ? "turned away" : "edge-on";
        add(`${family}: light, haze and grade, ${band}, ${facing}`, witnessError);
      }
      return {
        frame: frameError / Math.max(scoredCount, 1),
        terms: Array.from(termMap, ([name, { count, error }]) => ({
          ceiling: error / Math.max(scoredCount, 1),
          name,
          share: count / Math.max(scoredCount, 1),
        })).toSorted((first, second) => second.ceiling - first.ceiling),
      };
    },
    () => browser.close(),
  );
};
