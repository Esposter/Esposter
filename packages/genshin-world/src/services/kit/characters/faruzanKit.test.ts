import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FARUZAN_CHARACTER_ID, createFaruzanKit } from "#src/services/kit/characters/faruzanKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { createKitStepContext } from "#src/services/kit/createKitStepContext.test";

const FARUZAN_KIT = createFaruzanKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [FARUZAN_CHARACTER_ID]));

const createFaruzanCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: FARUZAN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: FARUZAN_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

describe(createFaruzanKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const party = createParty([FARUZAN_CHARACTER_ID]);
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (action: KitAction): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitStepContext(createFaruzanCombatant(), { body: kitBody, kitEffectState, party }));
    return kitEffectState.effects;
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...FARUZAN_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(FARUZAN_KIT.chargedAttack.hits).talentMultiplier,
      FARUZAN_KIT.plungeCollision.talentMultiplier,
      takeOne(FARUZAN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(FARUZAN_KIT.highPlunge.hits).talentMultiplier,
      takeOne(FARUZAN_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(FARUZAN_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.447295, 0.421864, 0.531635, 0.706206, 1.24, 0.568288, 1.136335, 1.419344, 1.488, 3.776,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the fully charged arrow lands at 96 frames, with its animation", () => {
    expect.hasAssertions();
    const arrowHitmark = Math.round(takeOne(FARUZAN_KIT.chargedAttack.hits).hitmarkSeconds * 60);

    expect(arrowHitmark).toBe(96);
    expect(Math.round(FARUZAN_KIT.chargedAttack.seconds * 60)).toBe(96);
  });

  test("the skill's cooldown is 6 seconds, and the burst costs 80 energy with a 20-second cooldown", () => {
    expect.hasAssertions();

    expect(FARUZAN_KIT.skillCooldownSeconds).toBe(6);
    expect(FARUZAN_KIT.burstCooldownSeconds).toBe(20);
    expect(FARUZAN_KIT.burstEnergyCost).toBe(80);
  });

  test("the Dazzling Polyhedron's first Whirlwind Pulse comes 3 seconds after the cast, then every 2 seconds", () => {
    expect.hasAssertions();
    const field = castEffects(FARUZAN_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");

    expect(field?.nextTickSeconds).toBe(3);
    expect(field?.tickIntervalSeconds).toBe(2);
    expect(field?.secondsRemaining).toBeCloseTo((43 + 745) / 60 + 0.1);
  });

  test("a Whirlwind Pulse casts from its gadget's place, and the party gains Prayerful Wind's Anemo DMG Bonus", () => {
    expect.hasAssertions();
    const field = castEffects(FARUZAN_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick({
      activeCombatant: createFaruzanCombatant(),
      characterIdCombatantMap: new Map([[FARUZAN_CHARACTER_ID, createFaruzanCombatant()]]),
      enemyMap: new Map(),
      kitEffectState,
      party,
      tickIndex: 0,
    });
    const pulse = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
    const buff = kitEffectState.effects.find((effect) => effect.kind === "buff");

    expect(pulse?.body.position.x).toBeCloseTo(5.19);
    expect(pulse?.body.position.z).toBeCloseTo(-10.5);
    expect(buff).toStrictEqual({
      amount: 0.18,
      attribute: Attribute.AnemoDamageBonus,
      characterId: FARUZAN_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 4,
      source: "faruzan-prayerful-wind",
    });
  });

  test("Prayerful Wind's Gift is given to the deployed team's members only", () => {
    expect.hasAssertions();
    const benchedCharacterId = FARUZAN_CHARACTER_ID + 1;
    const benchedParty = createParty([FARUZAN_CHARACTER_ID]);
    benchedParty.characterIdMemberMap.set(benchedCharacterId, createPartyMember());
    const field = castEffects(FARUZAN_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick({
      activeCombatant: createFaruzanCombatant(),
      characterIdCombatantMap: new Map([[FARUZAN_CHARACTER_ID, createFaruzanCombatant()]]),
      enemyMap: new Map(),
      kitEffectState,
      party: benchedParty,
      tickIndex: 0,
    });

    const buffedCharacterIds = kitEffectState.effects.flatMap((effect) =>
      effect.kind === "buff" ? [effect.characterId] : [],
    );

    expect(buffedCharacterIds).toStrictEqual([FARUZAN_CHARACTER_ID]);
  });

  test("the initial burst hit cuts the enemy's Anemo RES by 30% for 4 seconds", () => {
    expect.hasAssertions();
    const burstHit = takeOne(FARUZAN_KIT.elementalBurst.hits);

    expect(burstHit.enemyStatus?.(createFaruzanCombatant())).toStrictEqual({
      damageTakenBonus: 0,
      id: "faruzan-perfidious-wind-ruin",
      resistanceReduction: { Wind: 0.3 },
      secondsRemaining: 4,
    });
  });
});
