import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createAquilaFavoniaPassiveModule } from "#src/services/weapon/passives/createAquilaFavoniaPassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseAttack, value: 1250 },
    { attribute: Attribute.BaseHealth, value: 10_000 },
  ]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Falcon's Defiance at its first rank: the ATK share it adds is a static line, so its params carry a heal of 100% of ATK,
// A hit of 200% of ATK and a cooldown of fifteen seconds
const aquilaFavoniaPassiveModule = createAquilaFavoniaPassiveModule([0.2, 1, 2, 15]);
const createEnemyStrikeLoss = () => ({
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: -0.1,
  kind: KitEventKind.HealthChanged as const,
  overflowHealthShare: 0,
});

describe(createAquilaFavoniaPassiveModule, () => {
  test("taking DMG heals the wielder by the rank's share of ATK and queues its hit on the surrounding opponents", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare = 0.5;
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);

    expect(context.party.healthChanges).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: wielder.attributes.attack / wielder.attributes.maxHealth,
        overflowHealthShare: 0,
        sourceCharacterId: TRAVELER_CHARACTER_ID,
      },
    ]);
    expect(context.strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([2]);
  });

  test("taking DMG inside the fifteen-second cooldown heals and queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare = 0.5;
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);
    stepKitSeconds(context, 10);
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);

    expect(context.party.healthChanges).toHaveLength(1);
    expect(context.strikes).toStrictEqual([]);
  });

  test("a loss another character caused heals and queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aquilaFavoniaPassiveModule.onKitEvent?.(
      { ...createEnemyStrikeLoss(), sourceCharacterId: OTHER_CHARACTER_ID },
      context,
      wielder,
    );

    expect(context.party.healthChanges).toHaveLength(0);
    expect(context.strikes).toHaveLength(0);
  });
});
