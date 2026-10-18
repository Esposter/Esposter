import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TALENT_START_LEVELS } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { PROOF_PARTY_CHARACTER_IDS } from "#src/services/kit/constants.test";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { replayScriptedMinute } from "#src/services/kit/replayScriptedMinute.test";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The kits and tables the minute only reads, built and read once from the mirror; the minute builds the world it steps
// Afresh each run
const [characterIdKitMap, statTables, enemyTables] = await Promise.all([
  readCharacterKits(
    GAME_DATA_LOCAL_BASE_URL,
    new Map(PROOF_PARTY_CHARACTER_IDS.map((characterId) => [characterId, TALENT_START_LEVELS] as const)),
  ),
  readStatTables(GAME_DATA_LOCAL_BASE_URL),
  readEnemyTables(GAME_DATA_LOCAL_BASE_URL),
]);
// The proof party through the scripted minute, idle with no enemies and no effects, and in combat with enemies in reach
// And the party's effects up. A change to the step re-runs it on the machine that wrote the report, and the diff of the
// Report is the change's before against its after
describe(stepActiveKit, () => {
  test.for([
    { isInCombat: false, scale: "idle" },
    { isInCombat: true, scale: "in combat" },
  ])("a minute of the proof party, $scale", async ({ isInCombat }, { bench }) => {
    // A run is a minute of steps, tens of milliseconds, so forty rounds hold the margin to about a percent
    await bench("the fixed step", () => {
      replayScriptedMinute({ characterIdKitMap, enemyTables, isInCombat, statTables });
    }).run({ ...BENCHMARK_RUN_OPTIONS, iterations: 40, warmupIterations: 1 });
  });
});
