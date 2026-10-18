import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createHeavyPassiveModule } from "#src/services/weapon/passives/createHeavyPassiveModule";
import { takeOne } from "@esposter/shared";
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
// Heavy at its first rank: the multiplier and the cooldown in seconds
const heavyPassiveModule = createHeavyPassiveModule([1.6, 10]);
const createNormalAttackLanded = () => ({
  action: takeOne(TRAVELER_KIT.normalAttacks, 0),
  kind: KitEventKind.NormalAttackLanded as const,
});

describe(createHeavyPassiveModule, () => {
  test("a normal attack the active wielder lands queues one extra hit at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    heavyPassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(1.6);
  });

  test("a normal attack inside the rank's cooldown queues no second extra hit, and one after it queues another", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    heavyPassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);
    heavyPassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);

    expect(context.strikes).toHaveLength(1);

    stepKitSeconds(context, 10.1);
    heavyPassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);

    expect(context.strikes).toHaveLength(1);
  });
});
