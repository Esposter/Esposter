import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AINO_CHARACTER_ID, createAinoKitBehaviour } from "#src/services/kit/characters/ainoKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const AINO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, AINO_CHARACTER_ID);

describe(createAinoKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and burst's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...AINO_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      AINO_KIT.chargedAttack.hits[0]?.talentMultiplier,
      AINO_KIT.plungeCollision.talentMultiplier,
      AINO_KIT.lowPlunge.hits[0]?.talentMultiplier,
      AINO_KIT.highPlunge.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.664986, 0.661916, 0.492165, 0.492165, 1.1309, 0.745878, 1.49144, 1.862889]);
  });

  test("her burst costs 50 energy and cools for 13.5 seconds, her skill cools for 10 seconds, and her charged attack costs 40 stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: AINO_KIT.burstCooldownSeconds,
      burstEnergyCost: AINO_KIT.burstEnergyCost,
      chargedAttackStamina: AINO_KIT.chargedAttackStamina,
      skillCooldownSeconds: AINO_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 13.5,
      burstEnergyCost: 50,
      chargedAttackStamina: 40,
      skillCooldownSeconds: 10,
    });
  });

  test("her three strikes hit at their hitmarks and cancel at their default frames, the third striking twice", () => {
    expect.hasAssertions();
    expect(
      AINO_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: [23], seconds: 48 },
      { hitmarkFrames: [20], seconds: 75 },
      { hitmarkFrames: [35, 43], seconds: 93 },
    ]);
  });

  test("her skill's two stages land at 15 and 33 frames, and her burst plays no hit of its own", () => {
    expect.hasAssertions();
    expect({
      burstHits: AINO_KIT.elementalBurst.hits,
      skillHitmarkFrames: AINO_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({ burstHits: [], skillHitmarkFrames: [15, 33] });
  });
});
