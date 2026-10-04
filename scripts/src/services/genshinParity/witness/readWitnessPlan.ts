import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { INTERFACE_HEIGHT } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";

// How high over the ground the plan's eye stands, so far that a part's height barely moves where it lands: a curb
// 0.3 metres up lands 1.5 millimetres off its foot for every metre it stands off the eye's foot
const PLAN_EYE_HEIGHT = 200;
// The pixels a drawn row's width is a multiple of: WebGPU reads a target back in rows padded to 256 bytes, sixteen of
// Its pixels of four floats, and a narrower row comes back mixed into its neighbours
const ROW_PIXEL_MULTIPLE = 16;
const gcd = (first: number, second: number): number => (second === 0 ? first : gcd(second, first % second));
// A family's parts seen from straight above over a rectangle of the ground, in the state a reference stands them in,
// Drawn at so many pixels a metre: the unlit albedo its exported materials draw, its fourth channel 1 where a part is
// Drawn, the columns running toward +x and the rows toward +z from the rectangle's least corner. The rectangle is
// Lengthened toward +z to a whole multiple of the page's height, so the page's scale is whole and draws exactly the
// Pixels asked, and widened toward +x to a whole multiple of the readback's row, and its size as drawn is handed back. The eye stands
// High over the rectangle's middle looking straight down, its up toward +z, so its view's columns run toward -x and its
// Rows, read back from the top, toward -z, and both are turned back
export const readWitnessPlan = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  family: string,
  {
    least: [leastX, leastZ],
    pixelsPerMetre,
    size: [sizeX, sizeZ],
  }: { least: [number, number]; pixelsPerMetre: number; size: [number, number] },
): Promise<{ albedo: Float32Array; height: number; size: [number, number]; width: number }> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
  await fetchReferences();
  const scale = Math.ceil((sizeZ * pixelsPerMetre) / INTERFACE_HEIGHT);
  const height = scale * INTERFACE_HEIGHT;
  // A width the scale divides, so the page's own width is whole
  const widthMultiple = (ROW_PIXEL_MULTIPLE * scale) / gcd(ROW_PIXEL_MULTIPLE, scale);
  const width = Math.ceil((sizeX * pixelsPerMetre) / widthMultiple) * widthMultiple;
  const drawnSize: [number, number] = [width / pixelsPerMetre, height / pixelsPerMetre];
  const { browser, page } = await openParityPage({
    height,
    props: reference.props,
    screen: reference.screen,
    width,
    witness,
  });
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {
        camera: {
          fov: (2 * Math.atan(drawnSize[1] / 2 / PLAN_EYE_HEIGHT) * 180) / Math.PI,
          pitch: -Math.PI / 2,
          position: [leastX + drawnSize[0] / 2, PLAN_EYE_HEIGHT, leastZ + drawnSize[1] / 2],
          yaw: Math.PI,
        },
        families: [family],
      });
      const {
        height: drawnHeight,
        targets: { albedo = new Float32Array() },
        width: drawnWidth,
      } = await readWitnessTargets(page, [WitnessTargetName.Albedo]);
      if (drawnWidth !== width || drawnHeight !== height)
        throw new InvalidOperationError(
          Operation.Read,
          "plan",
          `drawn ${drawnWidth} by ${drawnHeight} pixels, not the ${width} by ${height} asked`,
        );
      const turned = new Float32Array(albedo.length);
      for (let row = 0; row < drawnHeight; row++)
        for (let column = 0; column < drawnWidth; column++) {
          const from = (row * drawnWidth + column) * 4;
          turned.set(
            albedo.subarray(from, from + 4),
            ((drawnHeight - 1 - row) * drawnWidth + (drawnWidth - 1 - column)) * 4,
          );
        }
      return { albedo: turned, height: drawnHeight, size: drawnSize, width: drawnWidth };
    },
    () => browser.close(),
  );
};
