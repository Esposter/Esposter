import type { ReactionType } from "#src/models/combat/ReactionType";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { FLOWER_OF_PARADISE_LOST_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createFlowerOfParadiseLostSetModule } from "#src/services/artifact/sets/createFlowerOfParadiseLostSetModule";
import { createReactionSetTeam } from "#src/services/artifact/sets/createReactionSetTeam.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const createTeam = (characterIds: number[]) =>
  createReactionSetTeam(
    createFlowerOfParadiseLostSetModule(getArtifactSetBonus(statTables, FLOWER_OF_PARADISE_LOST_ARTIFACT_SET_ID, 4)),
    characterIds,
  );

describe(createFlowerOfParadiseLostSetModule, () => {
  const BLOOM_TYPE_REACTION_TYPES: ReactionType[] = [
    TransformativeReactionType.Bloom,
    TransformativeReactionType.Hyperbloom,
    TransformativeReactionType.Burgeon,
  ];

  test("the wearer's own Bloom, Hyperbloom and Burgeon DMG is raised by 40%, and its Lunar-Bloom DMG by 10%, while another member's is not", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    for (const reactionType of BLOOM_TYPE_REACTION_TYPES) {
      expect(reactionDamageBonus(wearer, reactionType)).toBeCloseTo(0.4);
      expect(reactionDamageBonus(other, reactionType)).toBe(0);
    }
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarBloom)).toBeCloseTo(0.1);
    expect(reactionDamageBonus(other, LunarReactionType.LunarBloom)).toBe(0);
  });

  test("each Bloom-type or Lunar-Bloom reaction the wearer triggers adds a stack, up to four, raising its own DMG by 10% of Bloom and 2.5% of Lunar-Bloom a stack", () => {
    expect.hasAssertions();

    const { context, reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    for (const stacks of [1, 2, 3, 4, 4]) {
      trigger(wearer, [TransformativeReactionType.Hyperbloom]);
      expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.4 + 0.1 * stacks);
      stepKitSeconds(context, 1);
    }
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarBloom)).toBeCloseTo(0.1 + 0.025 * 4);
  });

  test("a stack lasts ten seconds from the last one gained, and the count starts again from one after they lapse", () => {
    expect.hasAssertions();

    const { context, reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const burgeonBonus = () => reactionDamageBonus(wearer, TransformativeReactionType.Burgeon);

    trigger(wearer, [TransformativeReactionType.Burgeon]);
    stepKitSeconds(context, 1);
    trigger(wearer, [TransformativeReactionType.Burgeon]);
    expect(burgeonBonus()).toBeCloseTo(0.6);

    stepKitSeconds(context, 9);
    expect(burgeonBonus()).toBeCloseTo(0.6);

    stepKitSeconds(context, 1);
    expect(burgeonBonus()).toBeCloseTo(0.4);

    trigger(wearer, [TransformativeReactionType.Burgeon]);
    expect(burgeonBonus()).toBeCloseTo(0.5);
  });

  test("a reaction the wearer triggers within a second of its last stack gives none", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [TransformativeReactionType.Bloom]);
    trigger(wearer, [TransformativeReactionType.Bloom]);

    expect(reactionDamageBonus(wearer, TransformativeReactionType.Bloom)).toBeCloseTo(0.5);
  });

  test("a Bloom a gadget of the wearer's triggers gives no stack, while a Hyperbloom it triggers does", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [TransformativeReactionType.Bloom], true);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Bloom)).toBeCloseTo(0.4);

    trigger(wearer, [TransformativeReactionType.Hyperbloom], true);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.5);
  });

  test("a reaction another member triggers gives the wearer no stack, while one the wearer triggers counts off the field", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, trigger, wearer } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);

    trigger(other, [TransformativeReactionType.Hyperbloom]);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.4);

    trigger(wearer, [TransformativeReactionType.Hyperbloom]);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.5);
  });
});
