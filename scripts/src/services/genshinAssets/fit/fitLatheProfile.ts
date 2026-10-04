import type { LatheProfile } from "#src/models/genshinAssets/fit/LatheProfile";

// A mesh's silhouette as a lathe: its outermost radius about its vertical axis in each band of height, which is what
// Its outline against the sky shows, then runs of bands whose radius holds within a share of itself merged into one
// Section. The axis is the middle of its footprint, so a tower whose pivot sits off its middle keeps its own axis
export const fitLatheProfile = (
  vertices: readonly (readonly [number, number, number])[],
  { bandHeight, tolerance }: { bandHeight: number; tolerance: number },
): LatheProfile => {
  const xs = vertices.map(([x]) => x);
  const ys = vertices.map(([, y]) => y);
  const zs = vertices.map((vertex) => vertex[2]);
  const axis: [number, number] = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
  const foot = Math.min(...ys);
  const bandCount = Math.max(1, Math.ceil((Math.max(...ys) - foot) / bandHeight));
  const radii = Array.from({ length: bandCount }, () => 0);
  for (const [x, y, z] of vertices) {
    const band = Math.min(Math.floor((y - foot) / bandHeight), bandCount - 1);
    radii[band] = Math.max(radii[band] ?? 0, Math.hypot(x - axis[0], z - axis[1]));
  }
  // A band with no vertex of its own lies along a straight run, so it keeps the radius below it
  for (let band = 1; band < bandCount; band++) if (radii[band] === 0) radii[band] = radii[band - 1] ?? 0;
  const sections: LatheProfile["sections"] = [];
  let start = 0;
  for (let band = 1; band <= bandCount; band++) {
    const startRadius = radii[start] ?? 0;
    if (band < bandCount && Math.abs((radii[band] ?? 0) - startRadius) <= tolerance * startRadius) continue;
    sections.push({ bottomRadius: startRadius, height: (band - start) * bandHeight, topRadius: startRadius });
    start = band;
  }
  return { axis, foot, sections };
};
