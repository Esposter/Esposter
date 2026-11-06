import { getScenarioTaskMismatches } from "#src/services/openspec/getScenarioTaskMismatches";
import { getScenarioTitle } from "#src/services/openspec/getScenarioTitle";
import { ARCHIVE_FOLDER, PROPOSAL_TASKS_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A change's tasks name the scenarios its spec delta holds, and each scenario is named by a task (the `openspec` skill,
// Process rule 4). The changes that do not agree yet are the open rows of the `openspec` ledger, which drains to
// Empty as they are reconciled: a listed change that agrees is a failure, as is an unlisted one that does not
describe("openspecScenarioTasks", () => {
  const SPECS_FOLDER = "specs";
  const SPEC_FILE = "spec.md";
  const LEDGER_PATH = join(REPOSITORY_ROOT, LEDGER_DIRECTORY, "openspec.md");
  // A row whose Swept cell is still the em dash is open. A dated row is a change already reconciled, held to the rule
  const OPEN_ROW_REGEX = /^\| (?<change>[^\s|]+)\s*\|\s*—\s*\|/gmu;

  // Every scenario title a change's delta holds, from each spec file under its `specs/` folder
  const readScenarioTitles = (changeDirectory: string): string[] => {
    const specsDirectory = join(changeDirectory, SPECS_FOLDER);
    if (!existsSync(specsDirectory)) return [];

    return readdirSync(specsDirectory, { recursive: true })
      .filter((path) => path.endsWith(SPEC_FILE))
      .flatMap((path) => readFileSync(join(specsDirectory, path), "utf8").split(/\r?\n/u))
      .map((line) => getScenarioTitle(line))
      .filter((title) => title !== "");
  };

  test("every open change's tasks and delta name the same scenarios, bar the ledger's open rows", () => {
    expect.hasAssertions();

    const changesDirectory = join(REPOSITORY_ROOT, PROPOSALS_DIRECTORY);
    const openRows = new Set(
      Array.from(readFileSync(LEDGER_PATH, "utf8").matchAll(OPEN_ROW_REGEX), ({ groups }) => groups?.change ?? ""),
    );
    const violations = readdirSync(changesDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== ARCHIVE_FOLDER)
      .map(({ name }) => {
        const changeDirectory = join(changesDirectory, name);
        const tasksPath = join(changeDirectory, PROPOSAL_TASKS_FILE);
        const tasksText = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "";
        return { id: name, mismatches: getScenarioTaskMismatches(tasksText, readScenarioTitles(changeDirectory)) };
      })
      .filter(
        ({ mismatches: { unheldByDelta, unnamedByTasks } }) => unheldByDelta.length > 0 || unnamedByTasks.length > 0,
      );
    const violatingIds = new Set(violations.map(({ id }) => id));

    const unlisted = violations
      .filter(({ id }) => !openRows.has(id))
      .map(
        ({ id, mismatches: { unheldByDelta, unnamedByTasks } }) =>
          `${id}: unheld by its delta ${JSON.stringify(unheldByDelta)}, unnamed by its tasks ${JSON.stringify(unnamedByTasks)}`,
      );
    const reconciled = [...openRows]
      .filter((id) => !violatingIds.has(id))
      .map((id) => `${id}: agrees now, so date its row or delete it`);

    expect(unlisted).toStrictEqual([]);
    expect(reconciled).toStrictEqual([]);
  });
});
