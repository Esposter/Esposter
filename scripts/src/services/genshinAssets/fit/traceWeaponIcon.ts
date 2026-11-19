import { traceTextureCell } from "#src/services/genshinAssets/fit/traceTextureCell";
import {
  CLOUD_COVERAGE_THRESHOLD,
  CLOUD_TRACE_TEXELS,
  CLOUD_TRACE_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

// The loops round where a weapon icon is painted, traced from its alpha, in the icon's own unit square with y up. Only
// The shape is kept, never a texel. Its grid, threshold and tolerance are the cloud tracer's, held once in the shared
// Constants, so a retune moves both tracers together
export const traceWeaponIcon = async (icon: Buffer | string): Promise<[number, number][][]> => {
  const { data, info } = await sharp(icon).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return traceTextureCell(data, info, {
    cell: { foot: info.height, height: info.height, left: 0, width: info.width },
    checkPainted: (texel) => (data[texel + 3] ?? 0) / BYTE > CLOUD_COVERAGE_THRESHOLD,
    texels: CLOUD_TRACE_TEXELS,
    tolerance: CLOUD_TRACE_TOLERANCE,
  });
};
