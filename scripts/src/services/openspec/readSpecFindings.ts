import { ARCHIVED_DELTA_PREFIX, OPENSPEC_SPEC_PATHSPEC } from "#src/services/openspec/constants";
import { lintRequirementSources } from "#src/services/openspec/lintRequirementSources";
import { lintScenarios } from "#src/services/openspec/lintScenarios";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every tracked or new spec in the repository, read from the working tree, so a spec being written is checked before
// It is committed.
export const readSpecFindings = (): string[] =>
  readSweepFilePaths(OPENSPEC_SPEC_PATHSPEC).flatMap((path) => {
    const markdown = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
    const findings = lintScenarios(path, markdown);
    // The citation rule reads only the live specs and the open changes, the archived deltas being shipped history
    if (!path.startsWith(ARCHIVED_DELTA_PREFIX)) findings.push(...lintRequirementSources(path, markdown));
    return findings;
  });
