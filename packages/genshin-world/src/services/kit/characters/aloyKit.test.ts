import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ALOY_CHARACTER_ID, createAloyKit } from "#src/services/kit/characters/aloyKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ALOY_KIT = createAloyKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [ALOY_CHARACTER_ID]));

const createAloyCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: ALOY_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ALOY_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

const bombletHits = (): KitHit[] => ALOY_KIT.elementalSkill.hits.slice(1);

describe(createAloyKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

  test("reads each talent multiplier from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...ALOY_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      takeOne(ALOY_KIT.chargedAttack.hits).talentMultiplier,
      ALOY_KIT.plungeCollision.talentMultiplier,
      takeOne(ALOY_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ALOY_KIT.highPlunge.hits).talentMultiplier,
      takeOne(ALOY_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(bombletHits()).talentMultiplier,
      takeOne(ALOY_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.2112, 0.2376, 0.4312, 0.528, 0.65648, 1.24, 0.568288, 1.136335, 1.419344, 1.776, 0.4, 3.592,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the fully charged shot lands at 96 frames, its arrow's 86 and the 10 frames of its travel", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(ALOY_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(96);
  });

  test("freeze Bomb lands at 25 frames, and each Chillwater Bomblet 6 frames after the last", () => {
    expect.hasAssertions();
    const hitmarks = ALOY_KIT.elementalSkill.hits.map((hit) => Math.round(hit.hitmarkSeconds * 60));

    expect(hitmarks).toStrictEqual([25, 31, 37]);
  });

  test("the fourth Chillwater Bomblet coil gives Cryo infusion and Rushing Ice, which holds off more coils", () => {
    expect.hasAssertions();
    const combatant = createAloyCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    const bomblet = takeOne(bombletHits());
    const strike = (): void => bomblet.onStrike?.(context, { body: kitBody, combatant, hit: bomblet });

    for (let index = 0; index < 3; index++) strike();
    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: ALOY_CHARACTER_ID,
        id: "aloy-coil",
        kind: "status",
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: 3,
      },
    ]);
    strike();
    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: ALOY_CHARACTER_ID,
        id: "aloy-coil",
        kind: "status",
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: 0,
      },
      { characterId: ALOY_CHARACTER_ID, element: Element.Cryo, kind: "infusion", secondsRemaining: 10 },
      { characterId: ALOY_CHARACTER_ID, id: "aloy-rushing-ice", kind: "status", secondsRemaining: 10 },
    ]);
    const effectsInRushingIce = [...kitEffectState.effects];
    strike();
    expect(kitEffectState.effects).toStrictEqual(effectsInRushingIce);
  });
});
