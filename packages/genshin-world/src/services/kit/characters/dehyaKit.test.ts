import type { KitAction } from "#src/models/kit/KitAction";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createDehyaKitBehaviour, DEHYA_CHARACTER_ID } from "#src/services/kit/characters/dehyaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const DEHYA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DEHYA_CHARACTER_ID);

describe(createDehyaKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and skill's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DEHYA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      DEHYA_KIT.plungeCollision.talentMultiplier,
      DEHYA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      DEHYA_KIT.highPlunge.hits[0]?.talentMultiplier,
      DEHYA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.621178, 0.617102, 0.766312, 0.952914, 0.745878, 1.49144, 1.862889, 1.1288]);
  });

  test("her burst costs 70 energy and cools for 18 seconds, and her skill cools for 20 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: DEHYA_KIT.burstCooldownSeconds,
      burstEnergyCost: DEHYA_KIT.burstEnergyCost,
      skillCooldownSeconds: DEHYA_KIT.skillCooldownSeconds,
    }).toStrictEqual({ burstCooldownSeconds: 18, burstEnergyCost: 70, skillCooldownSeconds: 20 });
  });

  test("molten inferno strikes on its press at 20 frames, with its animation at 39 frames", () => {
    expect.hasAssertions();
    const { elementalSkill } = DEHYA_KIT;
    expect({
      hitmarkFrames: Math.round((elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
      seconds: Math.round(elementalSkill.seconds * 60),
    }).toStrictEqual({ hitmarkFrames: 20, seconds: 39 });
  });

  test("her four strikes land their hitmarks at 22, 26, 26 and 41 frames", () => {
    expect.hasAssertions();
    expect(
      DEHYA_KIT.normalAttacks.map(({ hits }: KitAction) => Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60)),
    ).toStrictEqual([22, 26, 26, 41]);
  });

  test("her plunges' hitmarks fall at 38 and 41 frames, and the collision at 32", () => {
    expect.hasAssertions();
    expect({
      collisionFrames: Math.round(DEHYA_KIT.plungeCollision.hitmarkSeconds * 60),
      highFrames: Math.round((DEHYA_KIT.highPlunge.hits[0]?.hitmarkSeconds ?? 0) * 60),
      lowFrames: Math.round((DEHYA_KIT.lowPlunge.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({ collisionFrames: 32, highFrames: 41, lowFrames: 38 });
  });
});
