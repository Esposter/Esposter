import type { OpenChange } from "#src/models/openspec/OpenChange";

import { DELTA_SPECS_FOLDER, OPENSPEC_SPEC_FILE } from "#src/services/openspec/constants";
import { getScenarioTitle } from "#src/services/openspec/getScenarioTitle";
import { ARCHIVE_FOLDER, PROPOSAL_TASKS_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

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

// Every change under `openspec/changes/` short of the archive, whose shipped changes are history and open nothing
export const readOpenChanges = (): OpenChange[] => {
  const changesDirectory = join(REPOSITORY_ROOT, PROPOSALS_DIRECTORY);
  return readdirSync(changesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== ARCHIVE_FOLDER)
    .map(({ name }) => {
      const changeDirectory = join(changesDirectory, name);
      const tasksPath = join(changeDirectory, PROPOSAL_TASKS_FILE);
      return {
        id: name,
        scenarioTitles: readScenarioTitles(changeDirectory),
        tasksText: existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "",
      };
    });
};
