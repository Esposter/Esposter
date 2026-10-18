import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { getBenedictionBaseDamageBonus } from "#src/services/kit/characters/columbinaBenediction";
import { COLUMBINA_CHARACTER_ID, createColumbinaKitBehaviour } from "#src/services/kit/characters/columbinaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const COLUMBINA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, COLUMBINA_CHARACTER_ID);
const createColumbinaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: COLUMBINA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: COLUMBINA_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

describe(createColumbinaKitBehaviour, () => {
  const combatant = createColumbinaCombatant();
  // The effects a skill's press adds, as the kit's effects hold them
  const startEffects = (kitEffectState: KitEffectState): void =>
    COLUMBINA_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  // Two other members whose kits hold a Moonsign Benediction, declared here, to make a team at Ascendant Gleam with her
  const MOONSIGN_KIT: Kit = { ...COLUMBINA_KIT, moonsignBenediction: { lunarReactionTypes: [] } };
  const MOONSIGN_CHARACTER_IDS = [1, 2];
  // The reach of the hit a DoT tick summons, read with the team the characters make
  const getTickRadius = (characterIds: number[]): number | undefined => {
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    const characterIdCombatantMap = new Map(
      characterIds.map((characterId): [number, Combatant] => [
        characterId,
        { ...combatant, characterId, kit: characterId === COLUMBINA_CHARACTER_ID ? COLUMBINA_KIT : MOONSIGN_KIT },
      ]),
    );
    field?.onTick(
      createKitTestContext(combatant, { characterIdCombatantMap, kitEffectState, party: createParty(characterIds) }),
      0,
    );
    const summon = kitEffectState.effects.find((effect: KitEffect): effect is KitSummon => effect.kind === "summon");
    return summon?.hits[0]?.hitArea.radius;
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...COLUMBINA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(COLUMBINA_KIT.chargedAttack.hits).talentMultiplier,
      COLUMBINA_KIT.plungeCollision.talentMultiplier,
      takeOne(COLUMBINA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(COLUMBINA_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.46792, 0.366256, 0.58484, 1.1608, 0.568288, 1.136335, 1.419344]);
  });

  test("her skill and burst deal their multiplier on max HP, as gcsim's UseHP gives them", () => {
    expect.hasAssertions();
    const shares = [
      takeOne(COLUMBINA_KIT.elementalSkill.hits).additiveBaseDamageBonus,
      takeOne(COLUMBINA_KIT.elementalBurst.hits).additiveBaseDamageBonus,
    ].map((bonus) => bonus?.(combatant));
    expect(shares[0]).toBeCloseTo(0.1672 * 10_000);
    expect(shares[1]).toBeCloseTo(0.3224 * 10_000);
    expect(COLUMBINA_KIT.elementalSkill.hits.map(({ talentMultiplier }) => talentMultiplier)).toStrictEqual([0]);
  });

  test("the cooldowns, energy cost and charged stamina are read from the table", () => {
    expect.hasAssertions();
    expect([
      COLUMBINA_KIT.skillCooldownSeconds,
      COLUMBINA_KIT.burstCooldownSeconds,
      COLUMBINA_KIT.burstEnergyCost,
      COLUMBINA_KIT.chargedAttackStamina,
    ]).toStrictEqual([17, 15, 60, 50]);
  });

  test("a press of her skill sets its DoT field going for the table's duration, from the hit", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    expect(field?.kind).toBe("field");
    expect(Math.round((field?.secondsRemaining ?? 0) * 60)).toBe(25 * 60 + 21);
    expect(Math.round((field?.nextTickSeconds ?? 0) * 60)).toBe(138);
  });

  test("a press while the DoT runs restarts its duration rather than stacking a second field", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    if (field) field.secondsRemaining = 3;
    startEffects(kitEffectState);
    expect(kitEffectState.effects).toHaveLength(1);
    expect(Math.round((field?.secondsRemaining ?? 0) * 60)).toBe(25 * 60 + 21);
  });

  test("each DoT tick summons its hit at the field's centre, priced by her", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    field?.onTick(createKitTestContext(combatant, { kitEffectState }), 0);
    const summons = kitEffectState.effects.filter((effect: KitEffect): effect is KitSummon => effect.kind === "summon");
    expect(summons).toHaveLength(1);
    expect(summons[0]?.combatant).toBe(combatant);
    expect(summons[0]?.hits.map(({ hitmarkSeconds }) => hitmarkSeconds)).toStrictEqual([0]);
  });

  test("a DoT tick reaches four from the field's centre while her team is short of Ascendant Gleam", () => {
    expect.hasAssertions();
    expect(getTickRadius([COLUMBINA_CHARACTER_ID])).toBe(4);
  });

  test("a DoT tick reaches six from the field's centre at Ascendant Gleam, with two other Moonsign characters", () => {
    expect.hasAssertions();
    expect(getTickRadius([COLUMBINA_CHARACTER_ID, ...MOONSIGN_CHARACTER_IDS])).toBe(6);
  });

  test("her Benediction's Base DMG bonus is the curve of her max HP", () => {
    expect(COLUMBINA_KIT.moonsignBenediction?.getBaseDamageBonus?.(combatant)).toBeCloseTo(
      getBenedictionBaseDamageBonus(combatant.attributes.maxHealth),
    );
  });

  describe("ascension 1's Lunacy", () => {
    const strikeBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const strikeEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    // The CRIT Rate her charged attack gains after the given Gravity Interference ticks, at the given ascension
    const getCriticalRateBonus = (ascension: number, ticks: number): number => {
      const ascendedCombatant: Combatant = { ...combatant, ascension };
      const kitEffectState: KitEffectState = { effects: [] };
      COLUMBINA_KIT.elementalSkill.onStart?.(createKitTestContext(ascendedCombatant, { kitEffectState }));
      const [field] = kitEffectState.effects as KitField[];
      for (let tick = 0; tick < ticks; tick++)
        field?.onTick(createKitTestContext(ascendedCombatant, { kitEffectState }), 0);
      return (
        COLUMBINA_KIT.getStrikeCriticalRateBonus?.(
          { body: strikeBody, combatant: ascendedCombatant, hit: takeOne(COLUMBINA_KIT.chargedAttack.hits) },
          strikeEnemy,
          createParty([COLUMBINA_CHARACTER_ID]),
          kitEffectState.effects,
        ) ?? 0
      );
    };

    test("a passive takes effect at its ascension phase", () => {
      expect.hasAssertions();

      expect(getCriticalRateBonus(1, 1)).toBeCloseTo(0.05);
    });

    test("a passive does not take effect below its ascension phase", () => {
      expect.hasAssertions();

      expect(getCriticalRateBonus(0, 3)).toBe(0);
    });

    test("each Gravity Interference tick stacks Lunacy up to three", () => {
      expect.hasAssertions();

      expect(getCriticalRateBonus(1, 2)).toBeCloseTo(0.1);
      expect(getCriticalRateBonus(1, 5)).toBeCloseTo(0.15);
    });
  });
});
