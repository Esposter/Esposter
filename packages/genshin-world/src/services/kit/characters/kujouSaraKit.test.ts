import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKujouSaraKitBehaviour, KUJOU_SARA_CHARACTER_ID } from "#src/services/kit/characters/kujouSaraKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const SARA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KUJOU_SARA_CHARACTER_ID);
const createSaraCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 1000 }]),
  characterId: KUJOU_SARA_CHARACTER_ID,
  constellationCount,
  element: Element.Electro,
  elementalResonances: [],
  kit: SARA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

const checkIsSummon = (effect: KitEffect): effect is KitSummon => effect.kind === "summon";

// The effects an action's start adds, as the kit's effects hold them
const castEffects = (
  action: KitAction,
  combatant = createSaraCombatant(),
  kitEffectState: KitEffectState = { effects: [] },
): KitEffect[] => {
  action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState.effects;
};

describe(createKujouSaraKitBehaviour, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const stormclusters = castEffects(SARA_KIT.elementalBurst).find((effect) => checkIsSummon(effect));
    const multipliers = [
      ...SARA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(SARA_KIT.chargedAttack.hits).talentMultiplier,
      SARA_KIT.plungeCollision.talentMultiplier,
      takeOne(SARA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(SARA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(SARA_KIT.elementalBurst.hits).talentMultiplier,
      takeOne(stormclusters?.hits ?? []).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.36894, 0.387, 0.48504, 0.50396, 0.5805, 1.24, 0.568288, 1.136335, 1.419344, 4.096, 0.3412,
    ]);
  });

  test("a fully charged shot drops the Ambush under the Cover from Ascension 1, and spends the Cover", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    castEffects(SARA_KIT.elementalSkill, createSaraCombatant(1), kitEffectState);
    castEffects(SARA_KIT.chargedAttack, createSaraCombatant(0), kitEffectState);

    expect(kitEffectState.effects.find((effect) => checkIsSummon(effect))).toBeUndefined();

    castEffects(SARA_KIT.chargedAttack, createSaraCombatant(1), kitEffectState);
    const ambush = kitEffectState.effects.find((effect) => checkIsSummon(effect));
    const cover = kitEffectState.effects.find((effect): effect is KitStatus => effect.kind === "status");

    expect(takeOne(ambush?.hits ?? []).hitmarkSeconds).toBeCloseTo(150 / 60);
    expect(cover?.secondsRemaining).toBe(0);
  });

  test("subjugation's Stormclusters strike 24 times, and 36 from Constellation 4", () => {
    expect.hasAssertions();
    const constellationZeroHits = castEffects(SARA_KIT.elementalBurst, createSaraCombatant(0, 0)).find((effect) =>
      checkIsSummon(effect),
    )?.hits.length;
    const constellationFourHits = castEffects(SARA_KIT.elementalBurst, createSaraCombatant(0, 4)).find((effect) =>
      checkIsSummon(effect),
    )?.hits.length;

    expect(constellationZeroHits).toBe(24);
    expect(constellationFourHits).toBe(36);
  });

  test("the ATK Bonus Tengu Stormcall gives is a share of Sara's base ATK, to the character on the field", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const combatant = createSaraCombatant();
    const hit = takeOne(SARA_KIT.elementalBurst.hits);
    hit.onStrike?.(
      createKitTestContext(combatant, { kitEffectState }),
      { body: kitBody, combatant, hit },
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    );
    const atkBonus = kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff");

    expect(atkBonus?.amount).toBeCloseTo(0.4296 * 1000);
    expect(atkBonus?.attribute).toBe(Attribute.Attack);
    expect(atkBonus?.characterId).toBe(KUJOU_SARA_CHARACTER_ID);
  });
});

const OTHER_CHARACTER_ID = 10_000_001;

// The Energy each party member holds once the Ambush a fully charged shot under the Cover summons has struck, with Sara at
// The given ascension and Energy Recharge
const readEnergies = (ascension: number, energyRecharge: number): number[] => {
  const combatant = {
    ...createSaraCombatant(ascension),
    attributes: computeCharacterAttributes([{ attribute: Attribute.EnergyRecharge, value: energyRecharge }]),
  };
  const other = { ...createSaraCombatant(), characterId: OTHER_CHARACTER_ID };
  const party = createParty([KUJOU_SARA_CHARACTER_ID, OTHER_CHARACTER_ID]);
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, {
    characterIdCombatantMap: new Map([
      [KUJOU_SARA_CHARACTER_ID, combatant],
      [OTHER_CHARACTER_ID, other],
    ]),
    kitEffectState,
    party,
  });
  SARA_KIT.elementalSkill.onStart?.(context);
  SARA_KIT.chargedAttack.onStart?.(context);
  const hit = takeOne(takeOne(kitEffectState.effects.filter((effect) => checkIsSummon(effect))).hits);
  hit.onStrike?.(
    context,
    { body: { facing: 0, height: 0, position: { x: 0, z: 0 } }, combatant, hit },
    createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  );
  return [KUJOU_SARA_CHARACTER_ID, OTHER_CHARACTER_ID].map((characterId) => getPartyMember(party, characterId).energy);
};

describe("decorum", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    const energy = readEnergies(4, 1);

    expect(energy[0]).toBeGreaterThan(0);
    expect(energy[1]).toBe(energy[0]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readEnergies(3, 1)).toStrictEqual([0, 0]);
  });
});
