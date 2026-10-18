import type { HomeArea } from "#src/models/home/HomeArea";

import { HomeLoadState } from "#src/models/home/HomeLoadState";

// The state an area's load meter reads at `load`: red from the area's red load up, orange from its orange load up, else green
export const computeHomeLoadState = (
  load: number,
  { orangeLoad, redLoad }: Pick<HomeArea, "orangeLoad" | "redLoad">,
): HomeLoadState => {
  if (load >= redLoad) return HomeLoadState.Red;
  if (load >= orangeLoad) return HomeLoadState.Orange;
  return HomeLoadState.Green;
};
