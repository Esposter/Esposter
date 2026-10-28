import type { StallState } from "#src/models/genshinParity/shared/StallState";
import type { TracedState } from "#src/models/genshinParity/shared/TracedState";
import type { Page } from "playwright";

import { measureState } from "#src/services/genshinParity/shared/measureState";
import { orbit } from "#src/services/genshinParity/shared/orbit";
import { walk } from "#src/services/genshinParity/shared/walk";

const ORBIT_MS = 6000;
const PAUSE_MS = 1000;
const WALK_MS = 20_000;

// The states of one run, in order: the cold orbit straight after load, where the first sight of each pipeline lands, then
// A second orbit, then a walk, each after a pause so one state's frames do not run into the next
export const measureStates = async (page: Page): Promise<(TracedState & { state: StallState })[]> => {
  const coldOrbit = await measureState(page, "cold orbit", () => orbit(page, ORBIT_MS));
  await page.waitForTimeout(PAUSE_MS);
  const secondOrbit = await measureState(page, "second orbit", () => orbit(page, ORBIT_MS));
  await page.waitForTimeout(PAUSE_MS);
  const walkSeconds = Temporal.Duration.from({ milliseconds: WALK_MS }).total("seconds");
  const walked = await measureState(page, `walk ${walkSeconds} s`, () => walk(page, WALK_MS));

  return [coldOrbit, secondOrbit, walked];
};
