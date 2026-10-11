import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CharacterIdCreateKitMap } from "#src/generated/characterKitMap/CharacterIdCreateKitMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { PROOF_PARTY_CHARACTER_IDS } from "#src/services/kit/constants.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { replayScriptedMinute } from "#src/services/kit/replayScriptedMinute.test";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { describe, expect, test, vi } from "vitest";

// The strike log is read off the strikes each step hands the enemies, the strike itself left to run as it does
vi.mock(import("#src/services/kit/strikeKitEnemies"), async (importOriginal) => {
  const actual = await importOriginal();
  return { strikeKitEnemies: vi.fn<typeof actual.strikeKitEnemies>(actual.strikeKitEnemies) };
});

describe(stepActiveKit, () => {
  test("replays each kit alone and the proof party through the scripted minute to the strikes they land today", async () => {
    expect.hasAssertions();
    // Every kit module's character, and the Traveler, whose kit is the fallback
    const characterIds = [...Object.keys(CharacterIdCreateKitMap).map(Number), TRAVELER_CHARACTER_ID];
    const [talentMultiplierMap, statTables, enemyTables] = await Promise.all([
      readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, characterIds),
      readStatTables(GAME_DATA_LOCAL_BASE_URL),
      readEnemyTables(GAME_DATA_LOCAL_BASE_URL),
    ]);
    // Each team's strike log over the minute in combat: its strikes' count and, by attack tag, the sum of their
    // Multipliers
    const rows = [...characterIds.map((characterId) => [characterId]), PROOF_PARTY_CHARACTER_IDS].map(
      (teamCharacterIds) => {
        vi.mocked(strikeKitEnemies).mockClear();
        replayScriptedMinute({
          characterIds: teamCharacterIds,
          enemyTables,
          isInCombat: true,
          statTables,
          talentMultiplierMap,
        });
        const strikes = vi.mocked(strikeKitEnemies).mock.calls.flatMap(([stepStrikes]) => stepStrikes);
        const attackTagMultiplierMap = new Map<string, number>();
        for (const { attackTag = "untagged", hit } of strikes)
          attackTagMultiplierMap.set(attackTag, (attackTagMultiplierMap.get(attackTag) ?? 0) + hit.talentMultiplier);
        return {
          attackTagMultiplierMap,
          name: teamCharacterIds
            .map((characterId) => (CharacterIdCreateKitMap[characterId] ?? createTravelerKit).name)
            .join(", "),
          strikeCount: strikes.length,
        };
      },
    );
    const attackTags = [
      ...new Set(rows.flatMap(({ attackTagMultiplierMap }) => [...attackTagMultiplierMap.keys()])),
    ].toSorted();
    const table = [
      `| Kit | Strikes | ${attackTags.join(" | ")} |`,
      `| :-- | --: | ${attackTags.map(() => "--:").join(" | ")} |`,
      ...rows.map(
        ({ attackTagMultiplierMap, name, strikeCount }) =>
          `| ${name} | ${strikeCount} | ${attackTags.map((attackTag) => attackTagMultiplierMap.get(attackTag)?.toFixed(4) ?? "").join(" | ")} |`,
      ),
    ];

    await expect(
      [
        "# Replay digests",
        "",
        "Each kit alone, then the proof party, through the scripted minute (`replayScriptedMinute.test.ts`): the strikes",
        "each lands and, by attack tag, the sum of their multipliers. Written by `stepActiveKit.replay.test.ts`.",
        "",
        ...table,
        "",
      ].join("\n"),
    ).toMatchFileSnapshot("stepActiveKit.replay.snapshot.md");
  });
});
