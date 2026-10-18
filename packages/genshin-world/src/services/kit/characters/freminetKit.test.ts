import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createFreminetKitBehaviour, FREMINET_CHARACTER_ID } from "#src/services/kit/characters/freminetKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const FREMINET_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, FREMINET_CHARACTER_ID);

const createFreminetCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: FREMINET_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: FREMINET_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

// The strikes that land over the given frames of the world's fixed step, each frame's list read as the step leaves it
const landedStrikes = (context: KitContext, frames: number) => {
  const strikes: KitContext["strikes"] = [];
  for (let frame = 0; frame < frames; frame++) {
    stepKitSeconds(context, FIXED_STEP_SECONDS);
    strikes.push(...context.strikes);
  }
  return strikes;
};

describe(createFreminetKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and skill's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...FREMINET_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      FREMINET_KIT.chargedAttack.hits[0]?.talentMultiplier,
      FREMINET_KIT.plungeCollision.talentMultiplier,
      FREMINET_KIT.lowPlunge.hits[0]?.talentMultiplier,
      FREMINET_KIT.highPlunge.hits[0]?.talentMultiplier,
      FREMINET_KIT.elementalSkill.hits[0]?.talentMultiplier,
      FREMINET_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.842379, 0.806757, 1.01904, 1.238047, 0.62522, 0.745878, 1.49144, 1.862889, 0.8304, 3.184,
    ]);
  });

  test("the charged attack costs 40 stamina, his burst costs 60 energy and cools for 15 seconds, and his skill cools for 10 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: FREMINET_KIT.burstCooldownSeconds,
      burstEnergyCost: FREMINET_KIT.burstEnergyCost,
      chargedAttackStamina: FREMINET_KIT.chargedAttackStamina,
      skillCooldownSeconds: FREMINET_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 40,
      skillCooldownSeconds: 10,
    });
  });

  test("pressurized floe's upward thrust deals cryo at 29 frames, and shadowhunter's ambush at 44 frames", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: Math.round((FREMINET_KIT.elementalBurst.hits[0]?.hitmarkSeconds ?? 0) * 60),
      skillElement: FREMINET_KIT.elementalSkill.hits[0]?.element,
      skillHitmarkFrames: Math.round((FREMINET_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({ burstHitmarkFrames: 44, skillElement: Element.Cryo, skillHitmarkFrames: 29 });
  });

  test("each skill press queues spiritbreath thorn's cryo strike 62 frames later, and a press within nine seconds of one queues none", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createFreminetCombatant());
    FREMINET_KIT.elementalSkill.onStart?.(context);
    expect(landedStrikes(context, 61)).toStrictEqual([]);
    expect(landedStrikes(context, 1).map(({ hit }) => hit.element)).toStrictEqual([Element.Cryo]);
    FREMINET_KIT.elementalSkill.onStart?.(context);
    expect(landedStrikes(context, 480)).toStrictEqual([]);
    FREMINET_KIT.elementalSkill.onStart?.(context);
    expect(landedStrikes(context, 61)).toStrictEqual([]);
    expect(landedStrikes(context, 1)).toHaveLength(1);
  });
});
