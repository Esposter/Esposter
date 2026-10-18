import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { ALBEDO_CHARACTER_ID, createAlbedoKitBehaviour } from "#src/services/kit/characters/albedoKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
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

// Strikes an enemy inside the standing Solar Isotoma, then steps past the two-second cooldown the blossom leaves
const strikeInsideField = (context: KitContext, combatant: Combatant): void => {
  ALBEDO_KIT.onKitEvent?.(createDamageTaken({ x: 0, z: 0 }), context, combatant);
  stepKitTestEffects(3, context);
};
// The last summon the effects hold, which a burst's start puts there as it casts its Fatal Blossoms
const findLastSummon = (effects: KitEffect[]): KitSummon | undefined =>
  effects.findLast((effect): effect is KitSummon => effect.kind === "summon");

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

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = createAlbedoCombatant(0, 1);
    const context = createKitTestContext(combatant, { kitEffectState: { effects: [createStandingSolarIsotoma()] } });
    ALBEDO_KIT.onKitEvent?.(createDamageTaken({ x: 0, z: 0 }), context, combatant);

    const defenseBuff = castEffects(ALBEDO_KIT.elementalSkill, [], combatant).find(
      (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.DefensePercent,
    );

    expect(getPartyMember(context.party, ALBEDO_CHARACTER_ID).energy).toBeCloseTo(1.2);
    expect([defenseBuff?.amount, defenseBuff?.secondsRemaining]).toStrictEqual([0.5, 20]);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = createAlbedoCombatant(0, 0);
    const context = createKitTestContext(combatant, { kitEffectState: { effects: [createStandingSolarIsotoma()] } });
    ALBEDO_KIT.onKitEvent?.(createDamageTaken({ x: 0, z: 0 }), context, combatant);

    expect(getPartyMember(context.party, ALBEDO_CHARACTER_ID).energy).toBe(0);
    expect(
      castEffects(ALBEDO_KIT.elementalSkill, [], combatant).filter(
        (effect) => effect.kind === "buff" && effect.attribute === Attribute.DefensePercent,
      ),
    ).toStrictEqual([]);
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
  describe("constellation 2's Fatal Reckoning", () => {
    test("each Transient Blossom adds a stack, up to four, that the Fatal Blossoms take as flat damage", () => {
      expect.hasAssertions();
      const combatant = createAlbedoCombatant(0, 2);
      const kitEffectState: KitEffectState = { effects: [createStandingSolarIsotoma()] };
      const context = createKitTestContext(combatant, { kitEffectState, party: createParty([ALBEDO_CHARACTER_ID]) });
      strikeInsideField(context, combatant);
      strikeInsideField(context, combatant);
      strikeInsideField(context, combatant);
      strikeInsideField(context, combatant);
      strikeInsideField(context, combatant);
      const burstEffects = castEffects(ALBEDO_KIT.elementalBurst, kitEffectState.effects, combatant);
      const [fatalBlossom] = findLastSummon(burstEffects)?.hits ?? [];

      expect(fatalBlossom?.additiveBaseDamageBonus?.(combatant)).toBeCloseTo(1.2 * combatant.attributes.defense);
    });

    test("a Constellation 1 Albedo's Fatal Blossoms take no Fatal Reckoning damage", () => {
      expect.hasAssertions();
      const combatant = createAlbedoCombatant(0, 1);
      const kitEffectState: KitEffectState = { effects: [createStandingSolarIsotoma()] };
      const context = createKitTestContext(combatant, { kitEffectState, party: createParty([ALBEDO_CHARACTER_ID]) });
      strikeInsideField(context, combatant);
      const burstEffects = castEffects(ALBEDO_KIT.elementalBurst, kitEffectState.effects, combatant);
      const [fatalBlossom] = findLastSummon(burstEffects)?.hits ?? [];

      expect(fatalBlossom?.additiveBaseDamageBonus).toBeUndefined();
    });

    test("the stacks Tectonic Tide consumes leave its next Fatal Blossoms with no bonus", () => {
      expect.hasAssertions();
      const combatant = createAlbedoCombatant(0, 2);
      const kitEffectState: KitEffectState = { effects: [createStandingSolarIsotoma()] };
      const context = createKitTestContext(combatant, { kitEffectState, party: createParty([ALBEDO_CHARACTER_ID]) });
      strikeInsideField(context, combatant);
      const firstBurstEffects = castEffects(ALBEDO_KIT.elementalBurst, kitEffectState.effects, combatant);
      const [firstFatalBlossom] = findLastSummon(firstBurstEffects)?.hits ?? [];
      const secondBurstEffects = castEffects(ALBEDO_KIT.elementalBurst, firstBurstEffects, combatant);
      const [secondFatalBlossom] = findLastSummon(secondBurstEffects)?.hits ?? [];

      expect(firstFatalBlossom?.additiveBaseDamageBonus?.(combatant)).toBeCloseTo(0.3 * combatant.attributes.defense);
      expect(secondFatalBlossom?.additiveBaseDamageBonus).toBeUndefined();
    });
  });

  // Constellation 4's plunging attack bonus, read off the active member's buffed attributes as its hits are priced. The
  // Solar Isotoma is cast from the origin and stands from its spawn, 0.42 seconds in, and gcsim checks its field every
  // 0.3 seconds from that hitmark
  const createConstellation4Fixture = (constellationCount = 4, characterIds = [ALBEDO_CHARACTER_ID]) => {
    const combatant = createAlbedoCombatant(0, constellationCount);
    const kitEffectState: KitEffectState = { effects: [] };
    const party = createParty(characterIds);
    const characterIdCombatantMap = new Map([[ALBEDO_CHARACTER_ID, combatant]]);
    // The active member stands at the given x, the cast being made from the origin
    const stand = (x: number) =>
      createKitTestContext(combatant, { body: { facing: 0, height: 0, position: { x, z: 0 } }, kitEffectState, party });
    const cast = () => ALBEDO_KIT.elementalSkill.onStart?.(stand(0));
    // Steps the seconds with the active member standing at the given x, each step running the effects and the kit's clock
    const hold = (x: number, seconds: number) => {
      for (let index = 0; index < Math.round(seconds * 60); index++) {
        stepKitSeconds(stand(x), 1 / 60);
        ALBEDO_KIT.onStep?.(stand(x), combatant, 1 / 60);
      }
    };
    const getPlungingBonus = () =>
      getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap).attributes
        .attributeTotalMap[Attribute.PlungingAttackDamageBonus];
    // The characters the plunging attack bonus is a buff on, and the seconds each buff has left
    const getPlungingBuffs = () =>
      kitEffectState.effects.flatMap((effect) =>
        effect.kind === "buff" && effect.attribute === Attribute.PlungingAttackDamageBonus ? [effect] : [],
      );
    return { cast, getPlungingBonus, getPlungingBuffs, hold };
  };

  test("constellation 4 raises the active member's plunging attacks 30% while it stands in the standing Solar Isotoma's field", () => {
    expect.hasAssertions();
    const { cast, getPlungingBonus, hold } = createConstellation4Fixture();
    cast();
    hold(0, 0.8);
    expect(getPlungingBonus()).toBeCloseTo(0.3);
  });

  test("constellation 4 checks the field every 0.3 seconds from the Solar Isotoma's spawn, so the bonus waits for the first check", () => {
    expect.hasAssertions();
    const { cast, getPlungingBonus, hold } = createConstellation4Fixture();
    cast();
    hold(0, 0.65);
    expect(getPlungingBonus()).toBe(0);
    hold(0, 0.15);
    expect(getPlungingBonus()).toBeCloseTo(0.3);
  });

  test("constellation 4 refreshes its bonus at each 0.3 second check, not at each step", () => {
    expect.hasAssertions();
    const { cast, getPlungingBuffs, hold } = createConstellation4Fixture();
    cast();
    hold(0, 1);
    // A check refreshes the buff to its full second, and each step between checks only runs it down
    const refreshes = Array.from({ length: 60 }, () => {
      hold(0, 1 / 60);
      return getPlungingBuffs()[0]?.secondsRemaining;
    }).filter((secondsRemaining) => secondsRemaining === 1).length;
    expect(refreshes).toBeGreaterThanOrEqual(3);
    expect(refreshes).toBeLessThanOrEqual(4);
  });

  test("constellation 4's bonus runs out a second after the active member leaves the field", () => {
    expect.hasAssertions();
    const { cast, getPlungingBonus, hold } = createConstellation4Fixture();
    cast();
    hold(0, 1);
    hold(100, 0.5);
    expect(getPlungingBonus()).toBeCloseTo(0.3);
    hold(100, 0.6);
    expect(getPlungingBonus()).toBe(0);
  });

  test("constellation 4 raises the active member's plunging attacks alone, not a teammate's", () => {
    expect.hasAssertions();
    const { cast, getPlungingBuffs, hold } = createConstellation4Fixture(4, [
      ALBEDO_CHARACTER_ID,
      TRAVELER_CHARACTER_ID,
    ]);
    cast();
    hold(0, 1);
    expect(getPlungingBuffs().map((buff) => buff.characterId)).toStrictEqual([ALBEDO_CHARACTER_ID]);
  });

  test("constellation 4 raises nothing before its constellation", () => {
    expect.hasAssertions();
    const { cast, getPlungingBonus, hold } = createConstellation4Fixture(3);
    cast();
    hold(0, 1);
    expect(getPlungingBonus()).toBe(0);
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
