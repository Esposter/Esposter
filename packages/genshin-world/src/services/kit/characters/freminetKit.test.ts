import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { createFreminetKitBehaviour, FREMINET_CHARACTER_ID } from "#src/services/kit/characters/freminetKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const FREMINET_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, FREMINET_CHARACTER_ID);

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
});
