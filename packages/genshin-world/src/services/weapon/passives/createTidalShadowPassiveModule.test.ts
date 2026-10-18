import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createTidalShadowPassiveModule } from "#src/services/weapon/passives/createTidalShadowPassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
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
// White Cruising Wave at its first rank: twenty-four per cent ATK for eight seconds after the wielder is healed
const tidalShadowPassiveModule = createTidalShadowPassiveModule([0.24, 8, 0, 0]);
const createHealthChanged = (characterId: number, healthShare: number): KitEvent => ({
  characterId,
  healthShare,
  bondOfLifeShare: 0,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
});

describe(createTidalShadowPassiveModule, () => {
  test("a heal of the wielder raises its ATK by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tidalShadowPassiveModule.onKitEvent?.(createHealthChanged(TRAVELER_CHARACTER_ID, 0.5), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.24,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "tidalShadow",
      },
    ]);
  });

  test("a loss of the wielder's HP, or a heal of another character, raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tidalShadowPassiveModule.onKitEvent?.(createHealthChanged(TRAVELER_CHARACTER_ID, -0.2), context, wielder);
    tidalShadowPassiveModule.onKitEvent?.(createHealthChanged(OTHER_CHARACTER_ID, 0.5), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
