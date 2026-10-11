import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CharacterIdCreateKitBehaviourMap } from "#src/generated/characterKitMap/CharacterIdCreateKitBehaviourMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { PROOF_PARTY_CHARACTER_IDS } from "#src/services/kit/constants.test";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { replayScriptedMinute } from "#src/services/kit/replayScriptedMinute.test";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { createTravelerKitBehaviour } from "#src/services/kit/travelerKit";
import { uncapitalize } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

// The strike log is the strikes each step hands the enemies, copied as they are handed, since the step empties its list
// For the next, the strike itself left to run as it does
const strikeLog = vi.hoisted((): KitStrike[] => []);
vi.mock(import("#src/services/kit/strikeKitEnemies"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    strikeKitEnemies: (strikes, context) => {
      strikeLog.push(...strikes);
      actual.strikeKitEnemies(strikes, context);
    },
  };
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

// Every kit module's character, its digest beside its module, the Traveler, whose kit is the fallback, and the proof
// Party, whose digest is beside this test. One test a team, so each stays a minute of one team's steps, and each team's
// Kits are built for its own test, so no kit carries one minute's state into another's
const teams: [string, number[], string][] = [
  ...(await Promise.all(
    Object.entries(CharacterIdCreateKitBehaviourMap).map(async ([characterId, loadCreateBehaviour]) => {
      const { name } = await loadCreateBehaviour();
      return [
        name,
        // oxlint-disable-next-line typescript/no-unnecessary-type-conversion -- Object.entries keys are strings at runtime, though the record types them as numbers
        [Number(characterId)],
        `characters/${uncapitalize(name.replace(/^create/u, "").replace(/Behaviour$/u, ""))}.replay.snapshot.md`,
      ] satisfies [string, number[], string];
    }),
  )),
  [createTravelerKitBehaviour.name, [TRAVELER_CHARACTER_ID], "travelerKit.replay.snapshot.md"],
  ["the proof party", PROOF_PARTY_CHARACTER_IDS, "stepActiveKit.replay.snapshot.md"],
];

describe(stepActiveKit, () => {
  const tablesPromise = Promise.all([
    readStatTables(GAME_DATA_LOCAL_BASE_URL),
    readEnemyTables(GAME_DATA_LOCAL_BASE_URL),
  ]);

  test.each(teams)(
    "replays %s through the scripted minute to the strikes it lands today",
    async (_name, characterIds, snapshotPath) => {
      expect.hasAssertions();

      const [[statTables, enemyTables], characterIdKitMap] = await Promise.all([
        tablesPromise,
        readCharacterKits(GAME_DATA_LOCAL_BASE_URL, characterIds),
      ]);
      strikeLog.length = 0;
      replayScriptedMinute({ characterIdKitMap, enemyTables, isInCombat: true, statTables });

      await expect(toReplayDigest(strikeLog)).toMatchFileSnapshot(snapshotPath);
    },
  );
});
