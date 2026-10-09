import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { readSameTreeParentSha } from "#src/services/coderabbit/collect/readSameTreeParentSha";
import { runGit } from "#src/services/shared/runGit";

// Every sha a branch may carry `main`'s head under: its own; the parent with its exact tree, the reviewed head a
// Release merged, which the queue was rewritten onto when that window was cut; and every original its message names,
// Since the express lane cuts a queue commit onto `main` as a copy (`pickCommit`) while the queue keeps the original
export const readMainHeadIdentities = (mainSha: string, cwd: string): string[] =>
  [
    mainSha,
    readSameTreeParentSha(mainSha, cwd),
    ...getPortedShas(runGit(["log", "--max-count=1", "--format=%B", mainSha], cwd)),
  ].filter((sha) => sha !== undefined);
