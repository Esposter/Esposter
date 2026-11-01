import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OreItemIdBreakPoiseMap } from "#src/services/gathering/OreItemIdBreakPoiseMap";
import { readReactionOreHit } from "#src/services/gathering/readReactionOreHit";
import { strikeOreTimes } from "#src/services/gathering/strikeOreTimes.test";
import { describe, expect, test } from "vitest";

const { reactionPoiseMap } = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(readReactionOreHit, () => {
  const IRON_CHUNK_ITEM_ID = 101_001;
  const CRYSTAL_CHUNK_ITEM_ID = 101_003;

  test("breaks an Iron Chunk with one Overloaded, and a Crystal Chunk with four that three leave standing", () => {
    expect.hasAssertions();

    const hit = readReactionOreHit(reactionPoiseMap, TransformativeReactionType.Overloaded);
    const crystalChunkRequirement = OreItemIdBreakPoiseMap[CRYSTAL_CHUNK_ITEM_ID];

    expect(strikeOreTimes(1, hit, OreItemIdBreakPoiseMap[IRON_CHUNK_ITEM_ID])).toBe(1);
    expect(strikeOreTimes(3, hit, crystalChunkRequirement)).toBeLessThan(1);
    expect(strikeOreTimes(4, hit, crystalChunkRequirement)).toBe(1);
  });

  test("gives no hit for a reaction whose own hit is not blunt, though it deals poise", () => {
    expect.hasAssertions();

    expect(readReactionOreHit(reactionPoiseMap, TransformativeReactionType.Superconduct)).toBeUndefined();
  });
});
