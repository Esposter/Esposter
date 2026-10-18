import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { ALBEDO_CHARACTER_ID, createAlbedoKitBehaviour } from "#src/services/kit/characters/albedoKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const ALBEDO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ALBEDO_CHARACTER_ID);
const createAlbedoCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: 1000 }]),
  characterId: ALBEDO_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: ALBEDO_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

const createDamageTaken = (position: { x: number; z: number }): KitDamageTakenEvent => ({
  enemy: { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), position },
  hit: takeOne(ALBEDO_KIT.chargedAttack.hits),
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker: createAlbedoCombatant(),
});

// The effects an action's start adds to the effects given, as the kit's effects hold them
const castEffects = (
  action: KitAction,
  effects: KitEffect[] = [],
  combatant = createAlbedoCombatant(),
): KitEffect[] => {
  const kitEffectState: KitEffectState = { effects };
  action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState.effects;
};
// The Solar Isotoma as the press casts it, and as it stands once its hit has landed
const castSolarIsotoma = (): KitSummon =>
  takeOne(castEffects(ALBEDO_KIT.elementalSkill).filter((effect): effect is KitSummon => effect.kind === "summon"));
const createStandingSolarIsotoma = (): KitSummon => ({ ...castSolarIsotoma(), elapsedSeconds: 1 });
// The Elemental Mastery buffs Albedo's burst gives the team as it is cast beside a standing Solar Isotoma
const tectonicTideBuffs = (combatant: Combatant): KitBuff[] =>
  castEffects(ALBEDO_KIT.elementalBurst, [createStandingSolarIsotoma()], combatant).filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.ElementalMastery,
  );

// The DMG Bonus a Transient Blossom of Albedo's at the ascension takes on an enemy under half its HP
const getBlossomDamageBonus = (ascension: number): number | undefined => {
  const combatant = createAlbedoCombatant(ascension);
  const solarIsotoma = createStandingSolarIsotoma();
  const kitEffectState: KitEffectState = { effects: [solarIsotoma] };
  ALBEDO_KIT.onKitEvent?.(
    createDamageTaken({ x: 0, z: 0 }),
    createKitTestContext(combatant, { kitEffectState }),
    combatant,
  );
  const blossom = takeOne(
    kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon" && effect !== solarIsotoma),
  );
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  return ALBEDO_KIT.getStrikeDamageBonus?.(
    { body: blossom.body, combatant, hit: takeOne(blossom.hits) },
    { ...enemy, health: enemy.maxHealth / 4 },
    createParty([ALBEDO_CHARACTER_ID]),
  );
};

describe(createAlbedoKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const [fatalBlossom] =
      castEffects(ALBEDO_KIT.elementalBurst, [createStandingSolarIsotoma()]).findLast(
        (effect): effect is KitSummon => effect.kind === "summon",
      )?.hits ?? [];
    const multipliers = [
      ...ALBEDO_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...ALBEDO_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      ALBEDO_KIT.plungeCollision.talentMultiplier,
      takeOne(ALBEDO_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ALBEDO_KIT.highPlunge.hits).talentMultiplier,
      takeOne(castSolarIsotoma().hits).talentMultiplier,
      takeOne(ALBEDO_KIT.elementalBurst.hits).talentMultiplier,
      fatalBlossom?.talentMultiplier,
    ];
    const expectedMultipliers = [
      0.367392, 0.367392, 0.474548, 0.49751, 0.620739, 0.473, 0.602, 0.639324, 1.278377, 1.596762, 1.304, 3.672, 0.72,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the Solar Isotoma's hit lands at 25 frames on the field, which stands 30 seconds", () => {
    expect.hasAssertions();
    const solarIsotoma = castSolarIsotoma();

    expect(takeOne(solarIsotoma.hits).hitmarkSeconds).toBeCloseTo(25 / 60);
    expect(solarIsotoma.secondsRemaining).toBe(30);
  });

  test("a hit inside the standing Solar Isotoma sets off a Transient Blossom, priced by Albedo's DEF, and a cooldown after it", () => {
    expect.hasAssertions();
    const combatant = createAlbedoCombatant();
    const solarIsotoma = createStandingSolarIsotoma();
    const kitEffectState: KitEffectState = { effects: [solarIsotoma] };
    ALBEDO_KIT.onKitEvent?.(
      createDamageTaken({ x: 0, z: 0 }),
      createKitTestContext(combatant, { kitEffectState }),
      combatant,
    );
    const blossom = kitEffectState.effects.findLast(
      (effect): effect is KitSummon => effect.kind === "summon" && effect !== solarIsotoma,
    );
    const [blossomHit] = blossom?.hits ?? [];

    expect(blossomHit?.talentMultiplier).toBe(0);
    expect(blossomHit?.additiveBaseDamageBonus?.(combatant)).toBeCloseTo(1.336 * combatant.attributes.defense);
    expect(kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["summon", "status", "summon"]);
  });

  test("a hit outside the Solar Isotoma's field sets off no Transient Blossom", () => {
    expect.hasAssertions();
    const combatant = createAlbedoCombatant();
    const kitEffectState: KitEffectState = { effects: [createStandingSolarIsotoma()] };
    ALBEDO_KIT.onKitEvent?.(
      createDamageTaken({ x: 0, z: 30 }),
      createKitTestContext(combatant, { kitEffectState }),
      combatant,
    );

    expect(kitEffectState.effects).toHaveLength(1);
  });

  test("the Fatal Blossoms land seven times from 145 frames, every 5 frames, while the Solar Isotoma stands", () => {
    expect.hasAssertions();
    const blossomSummon = castEffects(ALBEDO_KIT.elementalBurst, [createStandingSolarIsotoma()]).findLast(
      (effect): effect is KitSummon => effect.kind === "summon",
    );
    const hitmarks = blossomSummon?.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

    expect(hitmarks).toStrictEqual([145, 150, 155, 160, 165, 170, 175]);
  });

  // Ascension 4's team Elemental Mastery
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(
      tectonicTideBuffs(createAlbedoCombatant(4)).map(({ amount, secondsRemaining }) => ({ amount, secondsRemaining })),
    ).toStrictEqual([{ amount: 125, secondsRemaining: 10 }]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(tectonicTideBuffs(createAlbedoCombatant(3))).toStrictEqual([]);
  });
});

describe("calcite Might", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getBlossomDamageBonus(1)).toBe(0.25);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getBlossomDamageBonus(0)).toBe(0);
  });
});
