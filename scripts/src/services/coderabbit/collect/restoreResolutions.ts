import type { ReplayInput } from "#src/models/coderabbit/collect/ReplayInput";

import { RESOLUTIONS_REF_PREFIX } from "#src/services/coderabbit/collect/constants";
import { readResolutionsDirectory } from "#src/services/coderabbit/collect/readResolutionsDirectory";
import { EMPTY_TREE_SHA } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { mkdirSync, rmSync } from "node:fs";

// Turns rerere on for the replay and hands it the resolutions an earlier run's replay of the branch recorded onto the
// Same target (`saveResolutions`), so a replay a run's budget cut short resumes past every conflict it already paid a
// Session for: rerere replays each, staged, and the stop is continued with none (`skipStops`). Every other record is
// Cleared first, so what the replay saves is its own. Read with no attributes, so each image is the bytes it was saved
// As. A missing ref, or one recorded against another target, restores nothing
export const restoreResolutions = ({
  branch,
  cwd,
  targetSha,
}: Pick<ReplayInput, "branch" | "cwd" | "targetSha">): void => {
  runGit(["config", "rerere.enabled", "true"], cwd);
  runGit(["config", "rerere.autoUpdate", "true"], cwd);
  const directory = readResolutionsDirectory(cwd);
  rmSync(directory, { force: true, recursive: true });
  mkdirSync(directory);
  const ref = `${RESOLUTIONS_REF_PREFIX}${branch}`;
  const isFetched = getResult(() => runGit(["fetch", "--quiet", "origin", `+${ref}:${ref}`], cwd)).match(
    () => true,
    () => false,
  );
  if (!isFetched || runGit(["log", "-1", "--format=%s", ref], cwd).trim() !== targetSha) return;
  runGit(
    [
      "--attr-source",
      EMPTY_TREE_SHA,
      `--work-tree=${directory}`,
      "restore",
      `--source=${ref}`,
      "--worktree",
      "--",
      ".",
    ],
    cwd,
  );
};
