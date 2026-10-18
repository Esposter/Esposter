import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKokomiKitBehaviour, KOKOMI_CHARACTER_ID } from "#src/services/kit/characters/kokomiKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KOKOMI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KOKOMI_CHARACTER_ID);

const MAX_HEALTH = 10_000;

const createKokomiCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: KOKOMI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KOKOMI_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// Bake-Kurage on the field with the given seconds left, then Nereid's Ascension cast at the given ascension
const readBakeKurageSeconds = (ascension: number): number | undefined => {
  const combatant = { ...createKokomiCombatant(), ascension };
  const context = createKitTestContext(combatant);
  KOKOMI_KIT.elementalSkill.onStart?.(context);
  const findField = () => context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
  const field = findField();
  if (field) field.secondsRemaining = 1;
  KOKOMI_KIT.elementalBurst.onStart?.(context);
  return findField()?.secondsRemaining;
};

// The bonus the garment's first normal attack adds to its damage, as Kokomi holds the given Healing Bonus
const readGarmentBonus = (ascension: number): number => {
  const combatant = {
    ...createKokomiCombatant(),
    ascension,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
      { attribute: Attribute.HealingBonus, value: 0.8 },
    ]),
  };
  const context = createKitTestContext(combatant);
  KOKOMI_KIT.elementalBurst.onStart?.(context);
  const garment = context.kitEffectState.effects.find((effect) => effect.kind === "stance");
  if (garment?.kind !== "stance") throw new Error("Nereid's Ascension starts no garment");
  const [firstNormalAttack] = garment.combatant.kit.normalAttacks;
  return firstNormalAttack?.hits[0]?.additiveBaseDamageBonus?.(combatant) ?? 0;
};

// The energy Kokomi holds after her garment's normal attack strikes at each of the given seconds, one strike per time
const readGarmentEnergy = (constellationCount: number, strikeSeconds: number[]): number => {
  const combatant = { ...createKokomiCombatant(), constellationCount };
  const context = createKitTestContext(combatant);
  KOKOMI_KIT.elementalBurst.onStart?.(context);
  const garment = context.kitEffectState.effects.find((effect) => effect.kind === "stance");
  if (garment?.kind !== "stance") throw new Error("Nereid's Ascension starts no garment");
  const hit = garment.combatant.kit.normalAttacks[0]?.hits[0];
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  let elapsedSeconds = 0;
  for (const seconds of strikeSeconds) {
    stepKitSeconds(context, seconds - elapsedSeconds);
    elapsedSeconds = seconds;
    hit?.onStrike?.(context, { body: context.body, combatant, hit }, enemy);
  }
  return getPartyMember(context.party, KOKOMI_CHARACTER_ID).energy;
};

// The Hydro DMG Bonus Kokomi's strike gets after a heal, by the given source, of the given attack or of none, on a member at the
// Given share of its Max HP, then the given seconds later, with the given constellations, on a strike that deals the given element
const readConstellation6Bonus = ({
  attackTag,
  constellationCount = 6,
  healthShareBefore = 0.8,
  hitElement,
  seconds = 0,
  sourceCharacterId = KOKOMI_CHARACTER_ID,
}: {
  attackTag?: AttackTag;
  constellationCount?: number;
  healthShareBefore?: number;
  hitElement?: Element;
  seconds?: number;
  sourceCharacterId?: number;
}): number => {
  const combatant = { ...createKokomiCombatant(), constellationCount, element: Element.Hydro };
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  KOKOMI_KIT.onKitEvent?.(
    {
      ...(attackTag === undefined ? {} : { attackTag }),
      bondOfLifeShare: 0,
      characterId: KOKOMI_CHARACTER_ID,
      healthShare: 0.1,
      healthShareAfter: Math.min(1, healthShareBefore + 0.1),
      healthShareBefore,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0,
      sourceCharacterId,
    },
    context,
    combatant,
  );
  stepKitSeconds(context, seconds);
  const hit = KOKOMI_KIT.normalAttacks[0]?.hits[0];
  if (hit === undefined) throw new Error("Kokomi has no normal attack hit");
  const strikeHit = { ...hit, ...(hitElement === undefined ? {} : { element: hitElement }) };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  return (
    KOKOMI_KIT.getStrikeDamageBonus?.(
      { body: context.body, combatant, hit: strikeHit },
      enemy,
      context.party,
      kitEffectState.effects,
    ) ?? 0
  );
};

describe(createKokomiKitBehaviour, () => {
  test("nereid's ascension's garment gives Kokomi's normal attacks a share of her Max HP to their damage, for ten seconds", () => {
    expect.hasAssertions();
    const combatant = createKokomiCombatant();
    const context = createKitTestContext(combatant);

    KOKOMI_KIT.elementalBurst.onStart?.(context);
    const garment = context.kitEffectState.effects.find((effect) => effect.kind === "stance");
    if (garment?.kind !== "stance") throw new Error("Nereid's Ascension starts no garment");
    const [firstNormalAttack] = garment.combatant.kit.normalAttacks;
    const bonus = firstNormalAttack?.hits[0]?.additiveBaseDamageBonus?.(combatant);

    expect(garment.secondsRemaining).toBe(10);
    expect(bonus).toBeCloseTo(0.0484 * MAX_HEALTH);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = { ...createKokomiCombatant(), constellationCount: 4 };
    const kitEffectState: KitEffectState = { effects: [] };
    KOKOMI_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    expect(KOKOMI_KIT.getNormalAttackSpeedBonus?.(createKitTestContext(combatant, { kitEffectState }))).toBe(0.1);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = { ...createKokomiCombatant(), constellationCount: 3 };
    const kitEffectState: KitEffectState = { effects: [] };
    KOKOMI_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    expect(KOKOMI_KIT.getNormalAttackSpeedBonus?.(createKitTestContext(combatant, { kitEffectState }))).toBe(0);
  });
});

describe("flawless Strategy", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const combatant = { ...createKokomiCombatant(), ascension: 0 };

    expect(KOKOMI_KIT.getPassiveBonuses?.(combatant, 1, [], [])).toStrictEqual([
      { amount: 0.25, attribute: Attribute.HealingBonus },
      { amount: -1, attribute: Attribute.CriticalRate },
    ]);
  });
});

describe("tamakushi Casket", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readBakeKurageSeconds(1)).toBe(12.5);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readBakeKurageSeconds(0)).toBe(1);
  });
});

describe("song of Pearls", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readGarmentBonus(4)).toBeCloseTo(0.0484 * MAX_HEALTH + 0.15 * 0.8 * MAX_HEALTH);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readGarmentBonus(3)).toBeCloseTo(0.0484 * MAX_HEALTH);
  });

  test("constellation 4 restores 0.8 energy to Kokomi for each garment normal attack that hits, once every 0.2 seconds", () => {
    expect.hasAssertions();

    expect([readGarmentEnergy(3, [0, 0.25]), readGarmentEnergy(4, [0, 0.1, 0.25])]).toStrictEqual([0, 1.6]);
  });
});

describe("constellation 6", () => {
  test("a Normal or Charged Attack's heal on a member at 80% HP or at maximum gives Kokomi a 40% Hydro DMG Bonus", () => {
    expect.hasAssertions();

    expect([
      readConstellation6Bonus({ attackTag: AttackTag.NormalAttack, healthShareBefore: 0.8 }),
      readConstellation6Bonus({ attackTag: AttackTag.ChargedAttack, healthShareBefore: 1 }),
    ]).toStrictEqual([0.4, 0.4]);
  });

  test("a heal on a member below 80% HP, a heal no attack makes, or another character's attack's heal gives no bonus", () => {
    expect.hasAssertions();

    expect([
      readConstellation6Bonus({ attackTag: AttackTag.NormalAttack, healthShareBefore: 0.79 }),
      readConstellation6Bonus({ healthShareBefore: 1 }),
      readConstellation6Bonus({ attackTag: AttackTag.NormalAttack, sourceCharacterId: 10_000_001 }),
    ]).toStrictEqual([0, 0, 0]);
  });

  test("the bonus lasts four seconds", () => {
    expect.hasAssertions();

    expect([
      readConstellation6Bonus({ attackTag: AttackTag.NormalAttack, seconds: 3.9 }),
      readConstellation6Bonus({ attackTag: AttackTag.NormalAttack, seconds: 4 }),
    ]).toStrictEqual([0.4, 0]);
  });

  test("constellation 5 gives no bonus", () => {
    expect.hasAssertions();

    expect(readConstellation6Bonus({ attackTag: AttackTag.NormalAttack, constellationCount: 5 })).toBe(0);
  });

  test("the bonus raises only Hydro damage", () => {
    expect.hasAssertions();

    expect([
      readConstellation6Bonus({ attackTag: AttackTag.NormalAttack }),
      readConstellation6Bonus({ attackTag: AttackTag.NormalAttack, hitElement: Element.Pyro }),
    ]).toStrictEqual([0.4, 0]);
  });
});
