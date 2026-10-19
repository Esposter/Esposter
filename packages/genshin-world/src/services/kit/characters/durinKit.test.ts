import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { TALENT_START_LEVELS } from "#src/services/character/constants";
import { createDurinKitBehaviour, DURIN_CHARACTER_ID } from "#src/services/kit/characters/durinKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const DURIN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DURIN_CHARACTER_ID);
// The white burst's three hits, then the black variant's three
const readBurstMultipliers = ({ elementalBurst, elementalBurstVariant }: Kit): number[] =>
  [...elementalBurst.hits, ...(elementalBurstVariant?.action.hits ?? [])].map(
    ({ talentMultiplier }) => talentMultiplier,
  );

describe(createDurinKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and burst's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DURIN_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      DURIN_KIT.chargedAttack.hits[0]?.talentMultiplier,
      DURIN_KIT.plungeCollision.talentMultiplier,
      DURIN_KIT.lowPlunge.hits[0]?.talentMultiplier,
      DURIN_KIT.highPlunge.hits[0]?.talentMultiplier,
      DURIN_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.456505, 0.410048, 0.291617, 0.291617, 0.711521, 1.13434, 0.639324, 1.278377, 1.596762, 1.1896,
    ]);
  });

  test("his burst costs 70 energy and cools for 18 seconds, his skill cools for 12 seconds, and his charged attack costs 20 stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: DURIN_KIT.burstCooldownSeconds,
      burstEnergyCost: DURIN_KIT.burstEnergyCost,
      chargedAttackStamina: DURIN_KIT.chargedAttackStamina,
      skillCooldownSeconds: DURIN_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 12,
    });
  });

  test("his four strikes hit at their hitmarks and cancel at their default frames", () => {
    expect.hasAssertions();
    expect(
      DURIN_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: [11], seconds: 29 },
      { hitmarkFrames: [9], seconds: 30 },
      { hitmarkFrames: [14, 37], seconds: 55 },
      { hitmarkFrames: [38], seconds: 66 },
    ]);
  });

  test("the press of Tap E plays no hit of its own, and its window's recasts are the chain's and the stance's", () => {
    expect.hasAssertions();
    expect({
      chainWindowSeconds: DURIN_KIT.elementalSkillChain?.windowSeconds,
      pressHits: DURIN_KIT.elementalSkill.hits,
      recastHits: DURIN_KIT.elementalSkillChain?.followUps.map(({ hits }) => hits.length),
    }).toStrictEqual({ chainWindowSeconds: 6, pressHits: [], recastHits: [1] });
  });

  test("his white burst's three hits are As the Light Shifts's, and its black variant's are As the Stars Smolder's", () => {
    expect.hasAssertions();
    expect({
      black: DURIN_KIT.elementalBurstVariant?.action.hits.map(({ talentMultiplier }) => talentMultiplier),
      white: DURIN_KIT.elementalBurst.hits.map(({ talentMultiplier }) => talentMultiplier),
    }).toStrictEqual({ black: [1.2544, 1.0176, 1.1184], white: [1.1896, 0.964, 1.1184] });
  });

  test("his burst's hits scale with its level", async () => {
    expect.hasAssertions();
    const burstKit = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DURIN_CHARACTER_ID, {
      ...TALENT_START_LEVELS,
      [CombatTalent.ElementalBurst]: 10,
    });
    const levelOneMultipliers = readBurstMultipliers(DURIN_KIT);
    const burstLevelMultipliers = readBurstMultipliers(burstKit);

    expect(
      burstLevelMultipliers.map((multiplier, index) => multiplier > takeOne(levelOneMultipliers, index)),
    ).toStrictEqual([true, true, true, true, true, true]);
  });
});
