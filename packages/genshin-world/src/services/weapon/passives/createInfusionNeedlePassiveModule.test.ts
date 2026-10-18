import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createInfusionNeedlePassiveModule } from "#src/services/weapon/passives/createInfusionNeedlePassiveModule";
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
// Infusion Needle at its first rank, which reads its extra hit's share of ATK from the affix row's first number
const infusionNeedlePassiveModule = createInfusionNeedlePassiveModule([0.2]);
const createParticleCollected = () => ({
  characterId: TRAVELER_CHARACTER_ID,
  count: 1,
  energyDropKind: EnergyDropKind.Particle,
  kind: KitEventKind.EnergyParticleCollected as const,
});
const createNormalAttackLanded = () => ({
  action: takeOne(TRAVELER_KIT.normalAttacks, 0),
  kind: KitEventKind.NormalAttackLanded as const,
});

describe(createInfusionNeedlePassiveModule, () => {
  test("a normal attack with no particle collected before it queues no extra hit", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    infusionNeedlePassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a normal attack after a particle is collected queues one extra hit for five seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    infusionNeedlePassiveModule.onKitEvent?.(createParticleCollected(), context, wielder);
    infusionNeedlePassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(0.2);

    stepKitSeconds(context, 5.1);
    infusionNeedlePassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });
});
