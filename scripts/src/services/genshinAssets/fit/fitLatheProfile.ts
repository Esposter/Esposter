import type { LatheProfile } from "#src/models/genshinAssets/fit/LatheProfile";

import { fitRadialProfile } from "#src/services/genshinAssets/fit/fitRadialProfile";

// A mesh's silhouette as a lathe: its outermost radius about its vertical axis in each band of height, which is what
// Its outline against the sky shows, then runs of bands whose radius holds within a share of itself merged into one
// Section. A radial profile at one angle, so the axis and the bands are the radial fit's own
export const fitLatheProfile = (
  vertices: readonly (readonly [number, number, number])[],
  { bandHeight, tolerance }: { bandHeight: number; tolerance: number },
): LatheProfile => {
  const { axis, foot, sections } = fitRadialProfile(vertices, { angleCount: 1, bandHeight, tolerance });
  return {
    axis,
    foot,
    sections: sections.map(({ height, radii }) => ({ bottomRadius: radii[0] ?? 0, height, topRadius: radii[0] ?? 0 })),
  };
};
