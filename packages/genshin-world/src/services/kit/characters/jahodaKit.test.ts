import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createJahodaKit, JAHODA_CHARACTER_ID } from "#src/services/kit/characters/jahodaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const JAHODA_KIT = createJahodaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [JAHODA_CHARACTER_ID]));

const createJahodaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: JAHODA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: JAHODA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

describe(createJahodaKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const party = createParty([JAHODA_CHARACTER_ID]);

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...JAHODA_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(JAHODA_KIT.chargedAttack.hits).talentMultiplier,
      JAHODA_KIT.plungeCollision.talentMultiplier,
      takeOne(JAHODA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(JAHODA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(JAHODA_KIT.elementalBurst.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.416739, 0.192313, 0.192313, 0.511975, 1.24, 0.568288, 1.136335, 1.419344, 2.072,
    ]);
  });

  test("each strike lands 10 frames after its hitmark, and each action cancels at its walk frame", () => {
    expect.hasAssertions();
    expect(
      JAHODA_KIT.normalAttacks.map((action) => ({
        cancelFrames: Math.round(action.seconds * 60),
        hitFrames: action.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      })),
    ).toStrictEqual([
      { cancelFrames: 35, hitFrames: [24] },
      { cancelFrames: 52, hitFrames: [25, 39] },
      { cancelFrames: 99, hitFrames: [50] },
    ]);
  });

  test("the press starts the pursuit with no hit, and its second press drains an unfilled flask at 4 frames", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const combatant = createJahodaCombatant();
    JAHODA_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState, party });
    expect(kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["field", "status", "field"]);
    const drain = takeOne(JAHODA_KIT.elementalSkillChain?.followUps ?? []);
    drain.onStart?.({ body: kitBody, combatant, kitEffectState, party });
    expect(kitEffectState.effects).toHaveLength(1);
    const [summon] = kitEffectState.effects;
    expect(summon?.kind === "summon" && takeOne(summon.hits)).toStrictEqual({
      element: Element.Anemo,
      gauge: 1,
      hitArea: { angle: 2 * Math.PI, height: 5, radius: 5 },
      hitmarkSeconds: 4 / 60,
      poiseDamage: 0,
      talentMultiplier: 1.908,
    });
  });
});
