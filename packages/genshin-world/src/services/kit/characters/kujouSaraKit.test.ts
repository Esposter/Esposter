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
import { createKujouSaraKit, KUJOU_SARA_CHARACTER_ID } from "#src/services/kit/characters/kujouSaraKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const SARA_KIT = createKujouSaraKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [KUJOU_SARA_CHARACTER_ID]));

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

describe(createKujouSaraKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const party = createParty([KUJOU_SARA_CHARACTER_ID]);
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (
    action: KitAction,
    combatant = createSaraCombatant(),
    kitEffectState: KitEffectState = { effects: [] },
  ): KitEffect[] => {
    action.onStart?.({ body: kitBody, combatant, kitEffectState, party });
    return kitEffectState.effects;
  };

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
    takeOne(SARA_KIT.elementalBurst.hits).onStrike?.({
      body: kitBody,
      combatant: createSaraCombatant(),
      kitEffectState,
      party,
    });
    const atkBonus = kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff");

    expect(atkBonus?.amount).toBeCloseTo(0.4296 * 1000);
    expect(atkBonus?.attribute).toBe(Attribute.Attack);
    expect(atkBonus?.characterId).toBe(KUJOU_SARA_CHARACTER_ID);
  });
});
