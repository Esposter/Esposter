import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";
import { parseProposalMetadata } from "#src/services/fleet/parseProposalMetadata";
import { parseProposalTasks } from "#src/services/fleet/parseProposalTasks";
import { PROPOSAL_METADATA_FILE, PROPOSAL_TASKS_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

interface OpenGenshinChange {
  areas: string[];
  hasOpenTask: boolean;
  id: string;
  phase?: number;
  pickPhase?: number;
}

// Every open Genshin change names the phase its lowest open task holds, the phase whose exit gate fails without it. The
// Roadmap is the one exemption: it groups its open items under a heading per phase (`roadmapPhases`) rather than naming
// One. Each change's files are read once here, and both tests read the same list. This is not `readProposalChanges`: it
// Skips a change with no design.md, which this check counts, and it does not return a change's open tasks
const ROADMAP_ID = "genshin-roadmap";
const readOpenGenshinChanges = (): OpenGenshinChange[] => {
  const changesDirectory = join(REPOSITORY_ROOT, PROPOSALS_DIRECTORY);
  return readdirSync(changesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(changesDirectory, entry.name, PROPOSAL_METADATA_FILE)))
    .map(({ name }) => {
      const changeDirectory = join(changesDirectory, name);
      const { areas, phase } = parseProposalMetadata(
        readFileSync(join(changeDirectory, PROPOSAL_METADATA_FILE), "utf8"),
      );
      const tasksPath = join(changeDirectory, PROPOSAL_TASKS_FILE);
      const { pickPhase, tasks } = parseProposalTasks(
        existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "",
        phase,
      );
      return { areas, hasOpenTask: tasks.some(({ isDone }) => !isDone), id: name, phase, pickPhase };
    })
    .filter(({ areas, id }) => areas[0] === GENSHIN_FLEET_AREA && id !== ROADMAP_ID);
};
const describeChange = ({ id, phase, pickPhase }: OpenGenshinChange): string =>
  `${id}: x-phase ${phase ?? "absent"}, pick phase ${pickPhase ?? "absent"}`;

describe("genshinChangePhases", () => {
  const genshinChanges = readOpenGenshinChanges();

  test("a genshin change names its phase", () => {
    expect.hasAssertions();

    const unnamed = genshinChanges.filter(({ phase }) => phase === undefined).map((change) => describeChange(change));

    expect(unnamed).toStrictEqual([]);
  });

  test("a change's phase is its lowest open task's", () => {
    expect.hasAssertions();

    // A change with no open task has no pick and is skipped, since its last x-phase stays as the record of its work
    const mismatched = genshinChanges
      .filter(({ hasOpenTask, phase, pickPhase }) => hasOpenTask && phase !== pickPhase)
      .map((change) => describeChange(change));

    expect(mismatched).toStrictEqual([]);
  });
});
