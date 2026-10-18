import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { absorbSourcewaterDroplets } from "#src/services/kit/effects/absorbSourcewaterDroplets";
import { castSourcewaterDroplet } from "#src/services/kit/effects/castSourcewaterDroplet";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};

describe(absorbSourcewaterDroplets, () => {
  test("absorbs the droplets inside its area up to its maximum, each once", () => {
    expect.hasAssertions();

    const { kitEffectState } = createKitTestContext(wielder);
    for (const x of [1, -1, 2, 3]) castSourcewaterDroplet(kitEffectState, TRAVELER_CHARACTER_ID, { x, z: 0 });
    const isInArea = ({ x }: { x: number }) => x > 0;
    const absorbedFirst = absorbSourcewaterDroplets(kitEffectState, TRAVELER_CHARACTER_ID, isInArea, 2);
    const absorbedAfter = absorbSourcewaterDroplets(kitEffectState, TRAVELER_CHARACTER_ID, isInArea, 3);
    const absorbedLast = absorbSourcewaterDroplets(kitEffectState, TRAVELER_CHARACTER_ID, isInArea, 3);
    expect({ absorbedAfter, absorbedFirst, absorbedLast }).toStrictEqual({
      absorbedAfter: 1,
      absorbedFirst: 2,
      absorbedLast: 0,
    });
  });
});
