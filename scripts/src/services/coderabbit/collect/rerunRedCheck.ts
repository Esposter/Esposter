import type { RerunInput } from "#src/models/coderabbit/collect/RerunInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { MAIN_BRANCH, RERUN_MARKER } from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { runGh } from "#src/services/shared/runGh";

// A red `main` the queue passes over the very same tree is no transit gap: nothing queued is missing from `main`, so no
// Window merging heals it, and it is a flake or a red of `main`'s own. Its failed jobs run once more, marked on the head
// First so a re-run GitHub refuses is never asked for twice, and the red is held for that run's verdict; one still red
// After it is the repairer's like any other. Whether the jobs were asked to run again now is what it returns
export const rerunRedCheck = ({ check, isDryRun, mainSha, queueCheck, viewerLogin }: RerunInput): boolean => {
  const marker = getMarker(RERUN_MARKER, mainSha);
  if (readCommitComments(mainSha).some((comment) => checkIsMarked(comment, viewerLogin, marker))) return false;

  const verdict = `${MAIN_BRANCH} is red on ${check.url}, which ${queueCheck.headBranch} passes over the same tree on ${queueCheck.url}: no transit gap but a flake or a red of its own, so its failed jobs run once more before it is repaired`;
  console.info(verdict);
  if (isDryRun) return true;

  postCommitComment(mainSha, `${marker}\n${verdict}.`);
  runGh(["run", "rerun", check.databaseId.toString(), "--failed"]);
  return true;
};
