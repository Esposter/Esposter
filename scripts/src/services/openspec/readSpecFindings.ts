import { OPENSPEC_SPEC_PATHSPEC } from "#src/services/openspec/constants";
import { lintRequirementSources } from "#src/services/openspec/lintRequirementSources";
import { lintScenarios } from "#src/services/openspec/lintScenarios";
import { ARCHIVE_FOLDER, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// An archived delta is shipped history that nothing rewrites, so the citation rule reads only the live specs and open changes.
const isArchivedDelta = (path: string) => path.startsWith(`${PROPOSALS_DIRECTORY}/${ARCHIVE_FOLDER}/`);

// Every tracked or new spec in the repository, read from the working tree, so a spec being written is checked before
// It is committed.
export const readSpecFindings = (): string[] =>
  readSweepFilePaths(OPENSPEC_SPEC_PATHSPEC).flatMap((path) => {
    const markdown = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
    const findings = lintScenarios(path, markdown);
    if (!isArchivedDelta(path)) findings.push(...lintRequirementSources(path, markdown));
    return findings;
  });
