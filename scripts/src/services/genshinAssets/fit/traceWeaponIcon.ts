import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceCoveredGrid } from "#src/services/genshinAssets/fit/traceCoveredGrid";
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
  const width = Math.floor(info.width / WEAPON_ICON_TRACE_TEXELS);
  const height = Math.floor(info.height / WEAPON_ICON_TRACE_TEXELS);
  const covered = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      // A grid cell is sampled at its middle texel, counted from the icon's foot so y runs up
      const texelX = x * WEAPON_ICON_TRACE_TEXELS + WEAPON_ICON_TRACE_TEXELS / 2;
      const texelY = info.height - (y * WEAPON_ICON_TRACE_TEXELS + WEAPON_ICON_TRACE_TEXELS / 2);
      const texel = (Math.floor(texelY) * info.width + Math.floor(texelX)) * info.channels;
      covered[y * width + x] = (data[texel + 3] ?? 0) / BYTE > WEAPON_ICON_COVERAGE_THRESHOLD ? 1 : 0;
    }
  return traceCoveredGrid(covered, { height, tolerance: WEAPON_ICON_TRACE_TOLERANCE, width }).map((loop) =>
    loop.map(([x, y]): [number, number] => [roundFitted(x / width), roundFitted(y / height)]),
  );
};
