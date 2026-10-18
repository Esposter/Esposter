import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKiraraKitBehaviour, KIRARA_CHARACTER_ID } from "#src/services/kit/characters/kiraraKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KIRARA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KIRARA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createKiraraCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KIRARA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KIRARA_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

describe(createKiraraKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...KIRARA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(KIRARA_KIT.chargedAttack.hits).talentMultiplier,
      KIRARA_KIT.plungeCollision.talentMultiplier,
      takeOne(KIRARA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(KIRARA_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.47902, 0.46354, 0.254216, 0.73272, 0.223772, 0.639324, 1.278377, 1.596762];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the press cools down for 8 seconds, and each hold level adds 0.4 seconds of cooldown per second held", () => {
    expect.hasAssertions();
    const threeSecondHold = KIRARA_KIT.elementalSkillHolds?.[3];

    expect(KIRARA_KIT.skillCooldownSeconds).toBe(8);
    expect(threeSecondHold?.minimumHeldSeconds).toBe(3);
    expect(threeSecondHold?.cooldownSeconds).toBeCloseTo(8 + 3 * 0.4);
    expect(KIRARA_KIT.elementalSkillHolds).toHaveLength(11);
  });

  test("a one-second hold's cat ticks land at 16 and 46 frames, and its kick 36 frames after its release", () => {
    expect.hasAssertions();
    const oneSecondHold = KIRARA_KIT.elementalSkillHolds?.[1];
    const hits = oneSecondHold?.action.hits ?? [];
    const frames = hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

    expect(frames).toStrictEqual([16, 46, 96]);
  });

  test("the shield is the share of Max HP and flat amount, capped at the maximum", () => {
    expect.hasAssertions();
    const effectState: KitEffectState = { effects: [] };
    KIRARA_KIT.elementalSkill.onStart?.(createKitTestContext(createKiraraCombatant(), { kitEffectState: effectState }));
    const shield = effectState.effects.find((effect): effect is KitShield => effect.kind === "shield");

    expect(shield?.health).toBeCloseTo(0.1 * 10_000 + 962.2313);
    expect(shield?.secondsRemaining).toBe(12);
  });

  test("secret Art: Surprise Dispatch sets six Cat Grass Cardamoms, two detonating at 180 frames and four at expiry", () => {
    expect.hasAssertions();
    const effectState: KitEffectState = { effects: [] };
    KIRARA_KIT.elementalBurst.onStart?.(createKitTestContext(createKiraraCombatant(), { kitEffectState: effectState }));
    const mines = effectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(mines?.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      180, 180, 800, 818, 836, 854,
    ]);
  });

  test("the burst costs 60 energy and cools down for 15 seconds", () => {
    expect.hasAssertions();
    expect(KIRARA_KIT.burstEnergyCost).toBe(60);
    expect(KIRARA_KIT.burstCooldownSeconds).toBe(15);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = { ...createKiraraCombatant(), constellationCount: 6 };
    const kitEffectState: KitEffectState = { effects: [] };
    KIRARA_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    expect(
      kitEffectState.effects.find(
        (effect) => effect.kind === "buff" && effect.attribute === Attribute.HydroDamageBonus,
      ),
    ).toStrictEqual({
      amount: 0.12,
      attribute: Attribute.HydroDamageBonus,
      characterId: KIRARA_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 15,
    });
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = { ...createKiraraCombatant(), constellationCount: 5 };
    const kitEffectState: KitEffectState = { effects: [] };
    KIRARA_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    expect(
      kitEffectState.effects.find(
        (effect) => effect.kind === "buff" && effect.attribute === Attribute.HydroDamageBonus,
      ),
    ).toBeUndefined();
  });
});

// The DMG Bonus Pupillary Variance gives a hit of hers from her Max HP, for the given attack, with her at the given ascension
const readStrikeDamageBonus = (ascension: number, attackTag: AttackTag): number => {
  const combatant = {
    ...createKiraraCombatant(),
    ascension,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  };
  return (
    KIRARA_KIT.getStrikeDamageBonus?.(
      {
        attackTag,
        body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
        combatant,
        hit: takeOne(KIRARA_KIT.elementalSkill.hits),
      },
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      createParty([KIRARA_CHARACTER_ID]),
    ) ?? 0
  );
};

describe("pupillary Variance", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect([
      readStrikeDamageBonus(4, AttackTag.ElementalSkill),
      readStrikeDamageBonus(4, AttackTag.ElementalBurst),
    ]).toStrictEqual([expect.closeTo(0.04), expect.closeTo(0.03)]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect([
      readStrikeDamageBonus(3, AttackTag.ElementalSkill),
      readStrikeDamageBonus(3, AttackTag.ElementalBurst),
    ]).toStrictEqual([0, 0]);
  });
});
