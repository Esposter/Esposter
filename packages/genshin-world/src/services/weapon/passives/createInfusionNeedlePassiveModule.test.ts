import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createInfusionNeedlePassiveModule } from "#src/services/weapon/passives/createInfusionNeedlePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
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
  const wielder: Combatant = createWielderCombatant();
  // Infusion Needle with synthetic params, which reads its extra hit's share of ATK from the first number
  const infusionNeedlePassiveModule = createInfusionNeedlePassiveModule([0.3]);

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
    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(0.3);

    stepKitSeconds(context, 5.1);
    infusionNeedlePassiveModule.onKitEvent?.(createNormalAttackLanded(), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });
});
