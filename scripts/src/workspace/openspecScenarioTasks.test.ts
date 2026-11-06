import { DELTA_SPECS_FOLDER, OPENSPEC_SPEC_FILE } from "#src/services/openspec/constants";
import { getScenarioTaskMismatches } from "#src/services/openspec/getScenarioTaskMismatches";
import { getScenarioTitle } from "#src/services/openspec/getScenarioTitle";
import { ARCHIVE_FOLDER, PROPOSAL_TASKS_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, test } from "vitest";

// Every scenario title a change's delta holds, from each spec file under its `specs/` folder
const readScenarioTitles = (changeDirectory: string): string[] => {
  const specsDirectory = join(changeDirectory, DELTA_SPECS_FOLDER);
  if (!existsSync(specsDirectory)) return [];

  // `readdir` answers with the platform's separator, which `OPENSPEC_SPEC_FILE` does not carry
  return readdirSync(specsDirectory, { encoding: "utf8", recursive: true })
    .map((path) => path.replaceAll(sep, "/"))
    .filter((path) => path.endsWith(OPENSPEC_SPEC_FILE))
    .flatMap((path) => readFileSync(join(specsDirectory, path), "utf8").split(/\r?\n/u))
    .map((line) => getScenarioTitle(line))
    .filter((title) => title !== "");
};

// A change's tasks name the scenarios its spec delta holds, and each scenario is named by a task (the `openspec` skill,
// Process rule 4). Every open change holds to it
describe("openspecScenarioTasks", () => {
  test("every open change's tasks and delta name the same scenarios", () => {
    expect.hasAssertions();

    const changesDirectory = join(REPOSITORY_ROOT, PROPOSALS_DIRECTORY);
    const mismatches = readdirSync(changesDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== ARCHIVE_FOLDER)
      .map(({ name }) => {
        const changeDirectory = join(changesDirectory, name);
        const tasksPath = join(changeDirectory, PROPOSAL_TASKS_FILE);
        const tasksText = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "";
        return { id: name, mismatches: getScenarioTaskMismatches(tasksText, readScenarioTitles(changeDirectory)) };
      })
      .filter(
        ({ mismatches: { unheldByDelta, unnamedByTasks } }) => unheldByDelta.length > 0 || unnamedByTasks.length > 0,
      )
      .map(
        ({ id, mismatches: { unheldByDelta, unnamedByTasks } }) =>
          `${id}: unheld by its delta ${JSON.stringify(unheldByDelta)}, unnamed by its tasks ${JSON.stringify(unnamedByTasks)}`,
      );

    expect(mismatches).toStrictEqual([]);
  });
});
