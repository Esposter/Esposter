import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createTimelessDreamEternalStovePassiveModule } from "#src/services/weapon/passives/createTimelessDreamEternalStovePassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createWielder = (energyRecharge: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.EnergyRecharge, value: energyRecharge }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createTimelessDreamEternalStovePassiveModule, () => {
  // Timeless Dream: Eternal Stove at its first rank: 28% ATK for each whole point of Energy Recharge over its base, up to 80%,
  // And 30% Energy Recharge for twelve seconds after an Elemental Burst
  const timelessDreamEternalStovePassiveModule = createTimelessDreamEternalStovePassiveModule([0.28, 0.8, 0.3, 12]);

  test("a wielder's Energy Recharge over the base raises ATK by the rank's share of it", () => {
    expect.hasAssertions();

    const wielder = createWielder(1.5);

    expect(timelessDreamEternalStovePassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.28 * 0.5, attribute: Attribute.AttackPercent },
    ]);
  });

  test("the ATK bonus stops at the rank's maximum", () => {
    expect.hasAssertions();

    const wielder = createWielder(5);

    expect(timelessDreamEternalStovePassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.8, attribute: Attribute.AttackPercent },
    ]);
  });

  test("an Elemental Burst's Energy Recharge counts toward the ATK bonus while it lasts", () => {
    expect.hasAssertions();

    const wielder = createWielder(1.5);
    const context = createKitTestContext(wielder);
    timelessDreamEternalStovePassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 0, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );

    expect(
      timelessDreamEternalStovePassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([{ amount: 0.28 * 0.8, attribute: Attribute.AttackPercent }]);
  });
});
