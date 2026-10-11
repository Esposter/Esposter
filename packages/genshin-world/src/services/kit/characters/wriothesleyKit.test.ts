import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { createWriothesleyKit, WRIOTHESLEY_CHARACTER_ID } from "#src/services/kit/characters/wriothesleyKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const WRIOTHESLEY_KIT = createWriothesleyKit(
  await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [WRIOTHESLEY_CHARACTER_ID]),
);

describe(createWriothesleyKit, () => {
  test("reads the strikes', charged attack's and plunges' multipliers from his proud skill group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...WRIOTHESLEY_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      WRIOTHESLEY_KIT.chargedAttack.hits[0]?.talentMultiplier,
      WRIOTHESLEY_KIT.plungeCollision.talentMultiplier,
      WRIOTHESLEY_KIT.lowPlunge.hits[0]?.talentMultiplier,
      WRIOTHESLEY_KIT.highPlunge.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.533596, 0.517987, 0.672228, 0.379041, 0.379041, 0.90742, 1.5296, 0.568288, 1.136335, 1.419344,
    ]);
  });

  test("the charged attack costs 50 stamina, his burst costs 60 energy and cools for 15 seconds, and his skill cools for 16 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: WRIOTHESLEY_KIT.burstCooldownSeconds,
      burstEnergyCost: WRIOTHESLEY_KIT.burstEnergyCost,
      chargedAttackStamina: WRIOTHESLEY_KIT.chargedAttackStamina,
      skillCooldownSeconds: WRIOTHESLEY_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 50,
      skillCooldownSeconds: 16,
    });
  });

  test("darkgold wolfbite strikes five times from 99 frames, every 5 frames", () => {
    expect.hasAssertions();
    expect(
      WRIOTHESLEY_KIT.elementalBurst.hits.map(({ hitmarkSeconds, talentMultiplier }) => ({
        frames: Math.round(hitmarkSeconds * 60),
        talentMultiplier,
      })),
    ).toStrictEqual([99, 104, 109, 114, 119].map((frames) => ({ frames, talentMultiplier: 1.272 })));
  });

  test("his strikes, charged attack, plunges and burst deal cryo, as gcsim gives them", () => {
    expect.hasAssertions();
    expect(
      [
        ...WRIOTHESLEY_KIT.normalAttacks.flatMap(({ hits }) => hits),
        ...WRIOTHESLEY_KIT.chargedAttack.hits,
        ...WRIOTHESLEY_KIT.elementalBurst.hits,
        ...WRIOTHESLEY_KIT.lowPlunge.hits,
      ].map(({ element }) => element),
    ).toStrictEqual(Array.from({ length: 13 }, () => Element.Cryo));
  });
});
