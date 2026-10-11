import type { KitStrike } from "#src/models/kit/KitStrike";

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
import { uncapitalize } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

// The strike log is read off the strikes each step hands the enemies, the strike itself left to run as it does
vi.mock(import("#src/services/kit/strikeKitEnemies"), async (importOriginal) => {
  const actual = await importOriginal();
  return { strikeKitEnemies: vi.fn<typeof actual.strikeKitEnemies>(actual.strikeKitEnemies) };
});

// A strike log's digest: its strikes' count and, by attack tag, the sum of their multipliers
const toReplayDigest = (strikes: KitStrike[]): string => {
  const attackTagMultiplierMap = new Map<string, number>();
  for (const { attackTag = "untagged", hit } of strikes)
    attackTagMultiplierMap.set(attackTag, (attackTagMultiplierMap.get(attackTag) ?? 0) + hit.talentMultiplier);
  const attackTags = [...attackTagMultiplierMap.keys()].toSorted();
  return [
    `| Strikes | ${attackTags.join(" | ")} |`,
    `| --: | ${attackTags.map(() => "--:").join(" | ")} |`,
    `| ${strikes.length} | ${attackTags.map((attackTag) => attackTagMultiplierMap.get(attackTag)?.toFixed(4)).join(" | ")} |`,
    "",
  ].join("\n");
};

describe(stepActiveKit, () => {
  // Every kit module's character, its digest beside its module, the Traveler, whose kit is the fallback, and the proof
  // Party, whose digest is beside this test. One test a team, so each stays a minute of one team's steps
  const teams: [string, number[], string][] = [
    ...Object.entries(CharacterIdCreateKitMap).flatMap(([characterId, createKit]) =>
      createKit
        ? [
            [
              createKit.name,
              // oxlint-disable-next-line typescript/no-unnecessary-type-conversion -- Object.entries keys are strings at runtime, though the record types them as numbers
              [Number(characterId)],
              `characters/${uncapitalize(createKit.name.replace(/^create/u, ""))}.replay.snapshot.md`,
            ] satisfies [string, number[], string],
          ]
        : [],
    ),
    [createTravelerKit.name, [TRAVELER_CHARACTER_ID], "travelerKit.replay.snapshot.md"],
    ["the proof party", PROOF_PARTY_CHARACTER_IDS, "stepActiveKit.replay.snapshot.md"],
  ];
  const tablesPromise = Promise.all([
    readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [...new Set(teams.flatMap(([, characterIds]) => characterIds))]),
    readStatTables(GAME_DATA_LOCAL_BASE_URL),
    readEnemyTables(GAME_DATA_LOCAL_BASE_URL),
  ]);

  test.each(teams)(
    "replays %s through the scripted minute to the strikes it lands today",
    async (_name, characterIds, snapshotPath) => {
      expect.hasAssertions();

      const [talentMultiplierMap, statTables, enemyTables] = await tablesPromise;
      replayScriptedMinute({ characterIds, enemyTables, isInCombat: true, statTables, talentMultiplierMap });

      await expect(
        toReplayDigest(vi.mocked(strikeKitEnemies).mock.calls.flatMap(([stepStrikes]) => stepStrikes)),
      ).toMatchFileSnapshot(snapshotPath);
    },
  );
});
