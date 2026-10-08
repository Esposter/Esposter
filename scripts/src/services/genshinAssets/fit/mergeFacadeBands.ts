import type { TowerFacade } from "#src/models/genshinAssets/fit/TowerFacade";

// A tower's bands from its foot up, each one run of its height at its own tone, merged into the run below while the
// Tone holds: a band joins the run when every channel of its shade lies within the tolerance of that run's first shade,
// So a slow drift up the tower splits where it leaves the first shade behind rather than walking along with the run
export const mergeFacadeBands = (bands: TowerFacade["bands"], tolerance: number): TowerFacade["bands"] => {
  const runs: TowerFacade["bands"] = [];
  for (const band of bands) {
    const last = runs.at(-1);
    if (last && band.shade.every((channel, index) => Math.abs(channel - (last.shade[index] ?? 0)) <= tolerance))
      last.to = band.to;
    else runs.push({ ...band });
  }
  return runs;
};
