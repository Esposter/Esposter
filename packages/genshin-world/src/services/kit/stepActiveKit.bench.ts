import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { PROOF_PARTY_CHARACTER_IDS } from "#src/services/kit/constants.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { replayScriptedMinute } from "#src/services/kit/replayScriptedMinute.test";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The tables the minute only reads, read once from the mirror; the minute builds the world it steps afresh each run
const [talentMultiplierMap, statTables, enemyTables] = await Promise.all([
  readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, PROOF_PARTY_CHARACTER_IDS),
  readStatTables(GAME_DATA_LOCAL_BASE_URL),
  readEnemyTables(GAME_DATA_LOCAL_BASE_URL),
]);
// The proof party through the scripted minute, idle with no enemies and no effects, and in combat with enemies in reach
// And the party's effects up, on today's path alone until the kit framework's path joins it in a comparison. The
// Framework re-runs it on the same machine after each of its phases, and the diff of the report is the before against
// The after
describe(stepActiveKit, () => {
  test.for([
    { isInCombat: false, scale: "idle" },
    { isInCombat: true, scale: "in combat" },
  ])("a minute of the proof party, $scale", async ({ isInCombat }, { bench }) => {
    // A run is a minute of steps, tens of milliseconds, so a few rounds hold the margin
    await bench("today's path", () => {
      replayScriptedMinute({
        characterIds: PROOF_PARTY_CHARACTER_IDS,
        enemyTables,
        isInCombat,
        statTables,
        talentMultiplierMap,
      });
    }).run({ ...BENCHMARK_RUN_OPTIONS, iterations: 5, warmupIterations: 1 });
  });
});
