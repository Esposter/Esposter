import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { toLuminance } from "#src/services/genshinParity/witness/toLuminance";
import { removeMaskSpecks } from "#src/services/recreation/image/removeMaskSpecks";
import { computeOtsuThreshold } from "#src/services/recreation/statistics/computeOtsuThreshold";
import { BYTE } from "#src/services/shared/constants";

// A flat receiver is a face turned within about 25 degrees of up, past what the walkway's carved relief bends its
// Normals by, so a shadow's edge across it is the occluder's and not the face's own turn
const RECEIVER_UP = 0.9;
// A run of shadow or light smaller than this many pixels at the reading's width is a texel's misreading rather than a
// Shadow, where a tower's shadow across the walkway covers thousands
const SHADOW_SPECK_AREA = 64;

// The reference's shadow and the receivers it falls on: the interior pixels of the parts that face up and are scored.
// Their shading, the log of the reference's luminance over the unlit albedo, splits by Otsu's threshold into shadow and
// Light, so a shadow over dark stone and over pale stone splits alike
export const computeReferenceShadow = ({
  albedo,
  checkIsScored,
  height,
  normal,
  part,
  shot,
  width,
}: {
  albedo: Float32Array;
  checkIsScored: (pixel: number, width: number) => boolean;
  height: number;
  normal: Float32Array;
  part: Float32Array;
  shot: Buffer;
  width: number;
}): { isReceiver: Uint8Array; isShadowed: Uint8Array } => {
  const isReceiver = Uint8Array.from({ length: width * height }, (_value, pixel) =>
    Number(
      checkIsPartInterior(part, width, height, pixel) &&
        checkIsScored(pixel, width) &&
        (normal[pixel * 4 + 1] ?? 0) >= RECEIVER_UP,
    ),
  );
  const shadings = Array.from(isReceiver, (isSet, pixel) => {
    if (!isSet) return 0;
    const shown = toLuminance(...getPixelDisplayColor(shot, pixel));
    const unlit = toLuminance(albedo[pixel * 4] ?? 0, albedo[pixel * 4 + 1] ?? 0, albedo[pixel * 4 + 2] ?? 0);
    return Math.log(Math.max(shown, Number.EPSILON) / Math.max(unlit, Number.EPSILON));
  });
  const receiverShadings = shadings.filter((_shading, pixel) => isReceiver[pixel]);
  // A reduce rather than a spread, since a frame's receivers outnumber the arguments a call takes
  const [least, most] = receiverShadings.reduce<[number, number]>(
    ([low, high], shading) => [Math.min(low, shading), Math.max(high, shading)],
    [Infinity, -Infinity],
  );
  const toByte = (shading: number): number => ((shading - least) / Math.max(most - least, Number.EPSILON)) * BYTE;
  const threshold = computeOtsuThreshold(receiverShadings.map((shading) => toByte(shading)));
  const isShadowed = Uint8Array.from(shadings, (shading, pixel) =>
    Number(Boolean(isReceiver[pixel]) && toByte(shading) <= threshold),
  );
  removeMaskSpecks(isShadowed, width, height, SHADOW_SPECK_AREA);
  return { isReceiver, isShadowed };
};
