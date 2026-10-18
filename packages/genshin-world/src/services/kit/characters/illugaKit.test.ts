import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createIllugaKitBehaviour, ILLUGA_CHARACTER_ID } from "#src/services/kit/characters/illugaKit";
import { HAUNTED_NIGHT_STATUS_ID, NIGHTINGALE_SONG_STATUS_ID } from "#src/services/kit/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ILLUGA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ILLUGA_CHARACTER_ID);

const MAX_HEALTH = 10_000;

const createIllugaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: ILLUGA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ILLUGA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

describe(createIllugaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(ILLUGA_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(ILLUGA_KIT.chargedAttack.hits).talentMultiplier,
      ILLUGA_KIT.plungeCollision.talentMultiplier,
      takeOne(ILLUGA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ILLUGA_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.473662, 1.11026, 0.639324, 1.278377, 1.596762]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 25 stamina for its charged attack, its skill cooling for 15 seconds", () => {
    expect.hasAssertions();
    expect(ILLUGA_KIT.burstEnergyCost).toBe(60);
    expect(ILLUGA_KIT.burstCooldownSeconds).toBe(15);
    expect(ILLUGA_KIT.chargedAttackStamina).toBe(25);
    expect(ILLUGA_KIT.skillCooldownSeconds).toBe(15);
  });

  test("his burst gains Haunted Night's Oriole-Song for 20 seconds, with 21 stacks of Nightingale's Song", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIllugaCombatant());

    ILLUGA_KIT.elementalBurst.onStart?.(context);

    expect(
      findKitStatus(context.kitEffectState.effects, ILLUGA_CHARACTER_ID, HAUNTED_NIGHT_STATUS_ID)?.secondsRemaining,
    ).toBe(20);
    expect(countKitResource(context.kitEffectState.effects, ILLUGA_CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(21);
  });
});
