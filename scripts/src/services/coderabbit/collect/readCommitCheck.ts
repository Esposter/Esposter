import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import { CHECK_RUN_FIELDS, COMMIT_CHECK_RUN_LIST_LIMIT } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// A workflow's newest run on a commit, found by the commit: GitHub's per-workflow branch filter has held none of a
// Branch's runs for weeks at a time — `develop`'s after 2026-09-24, `main`'s after April — so a read that must find the
// Run over one known commit never narrows by branch on GitHub's side. Named a branch, it is that branch's newest run
// Over the commit, picked here from all of them: several branches run over one commit — the return stroke fast-forwards
// `develop` onto `main`'s head, and `develop`'s run is then the newest there — so a branch's verdict read by the commit
// Alone was whichever branch ran last
export const readCommitCheck = (workflow: string, sha: string, branch = ""): MainCheck | undefined => {
  const checks = parseMachineJson<MainCheck[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      workflow,
      "--commit",
      sha,
      "--limit",
      COMMIT_CHECK_RUN_LIST_LIMIT.toString(),
      "--json",
      CHECK_RUN_FIELDS,
    ]),
  );
  return branch ? checks.find(({ headBranch }) => headBranch === branch) : checks.at(0);
};
