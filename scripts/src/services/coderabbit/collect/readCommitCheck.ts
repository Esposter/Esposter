import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import { CHECK_RUN_FIELDS } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// A workflow's newest run on a commit, on whichever branch it ran, found by the commit alone: GitHub's per-workflow
// Branch filter has held none of a branch's runs for weeks at a time — `develop`'s after 2026-09-24, `main`'s after
// April — so a read that must find the run over one known commit never narrows by branch
export const readCommitCheck = (workflow: string, sha: string): MainCheck | undefined =>
  parseMachineJson<MainCheck[]>(
    runGh(["run", "list", "--workflow", workflow, "--commit", sha, "--limit", "1", "--json", CHECK_RUN_FIELDS]),
  ).at(0);
