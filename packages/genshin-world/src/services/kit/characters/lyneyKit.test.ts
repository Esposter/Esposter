import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createLyneyKitBehaviour, LYNEY_CHARACTER_ID } from "#src/services/kit/characters/lyneyKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const LYNEY_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LYNEY_CHARACTER_ID);
const getSummonHitmarkSeconds = (kitEffectState: KitEffectState): number | undefined => {
  const summon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
  return summon?.hits[0]?.hitmarkSeconds;
};

describe(createLyneyKitBehaviour, () => {
  // The effects a start adds to the team's, which its owner holds
  const startAction = (action: KitAction): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitTestContext(createLyneyCombatant(), { kitEffectState }));
    return kitEffectState;
  };

  const createLyneyCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: LYNEY_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: LYNEY_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', Prop Arrow's and plunges' multipliers from his proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LYNEY_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...LYNEY_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      LYNEY_KIT.plungeCollision.talentMultiplier,
      LYNEY_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LYNEY_KIT.highPlunge.hits[0]?.talentMultiplier,
      LYNEY_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.38786, 0.38012, 0.27262, 0.27262, 0.56932, 1.728, 0.568288, 1.136335, 1.419344, 1.672,
    ]);
  });

  test("his burst cools for 15 seconds and costs 60 energy, his skill cools for 15 seconds, and his charged attack costs no stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: LYNEY_KIT.burstCooldownSeconds,
      burstEnergyCost: LYNEY_KIT.burstEnergyCost,
      chargedAttackStamina: LYNEY_KIT.chargedAttackStamina,
      skillCooldownSeconds: LYNEY_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 0,
      skillCooldownSeconds: 15,
    });
  });

  test("the Prop Arrow's Grin-Malkin Hat expires 238 frames after it lands, and its Pyrotechnic Strike travels 36 frames more", () => {
    expect.hasAssertions();
    expect(getSummonHitmarkSeconds(startAction(LYNEY_KIT.chargedAttack))).toBeCloseTo((113 + 238 + 36) / 60);
  });

  test("the burst's Grin-Malkin Hat is set 282 frames after its cast, and its Pyrotechnic Strike lands 245 frames after that and 36 more", () => {
    expect.hasAssertions();
    expect(getSummonHitmarkSeconds(startAction(LYNEY_KIT.elementalBurst))).toBeCloseTo((282 + 245 + 36) / 60);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = { ...createLyneyCombatant(), constellationCount: 4 };
    const kitEffectState: KitEffectState = { effects: [] };
    LYNEY_KIT.chargedAttack.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    const summon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(summon?.hits[0]?.enemyStatus?.(combatant)?.resistanceReduction).toStrictEqual({ [Element.Pyro]: 0.2 });
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = { ...createLyneyCombatant(), constellationCount: 3 };
    const kitEffectState: KitEffectState = { effects: [] };
    LYNEY_KIT.chargedAttack.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    const summon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(summon?.hits[0]?.enemyStatus?.(combatant)).toBeUndefined();
  });
});
