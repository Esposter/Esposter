import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { Seelie } from "#src/models/puzzle/Seelie";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { SEELIE_CHEST_KIND } from "#src/services/puzzle/constants";

// The chest each Seelie settled in its court spawns, on the court's ground. A Seelie not yet settled spawns none
export const computeSeelieChestPlaces = (seelies: readonly Seelie[]): ChestPlace[] =>
  seelies
    .filter(({ state }) => state === SeelieState.Settled)
    .map(({ court, id }) => ({ id: `seelie-chest-${id}`, kind: SEELIE_CHEST_KIND, position: court }));
