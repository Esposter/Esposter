import { traceTextureCell } from "#src/services/genshinAssets/fit/traceTextureCell";
import {
  WEAPON_ICON_COVERAGE_THRESHOLD,
  WEAPON_ICON_TRACE_TEXELS,
  WEAPON_ICON_TRACE_TOLERANCE,
} from "#src/services/genshinAssets/weapons/constants";
import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

// The loops round where a weapon icon is painted, traced from its alpha, in the icon's own unit square with y up. Only
// The shape is kept, never a texel
export const traceWeaponIcon = async (icon: Buffer | string): Promise<[number, number][][]> => {
  const { data, info } = await sharp(icon).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return traceTextureCell(data, info, {
    cell: { foot: info.height, height: info.height, left: 0, width: info.width },
    checkPainted: (texel) => (data[texel + 3] ?? 0) / BYTE > WEAPON_ICON_COVERAGE_THRESHOLD,
    texels: WEAPON_ICON_TRACE_TEXELS,
    tolerance: WEAPON_ICON_TRACE_TOLERANCE,
  });
};
