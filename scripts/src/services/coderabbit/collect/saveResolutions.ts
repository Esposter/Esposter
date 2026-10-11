import type { ReplayInput } from "#src/models/coderabbit/collect/ReplayInput";

import { RESOLUTIONS_REF_PREFIX } from "#src/services/coderabbit/collect/constants";
import { readResolutionsDirectory } from "#src/services/coderabbit/collect/readResolutionsDirectory";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Pushes the resolutions the replay has recorded so far over the branch's ref, as a commit naming the target they were
// Made against: only a replay onto the same tree restores them (`restoreResolutions`), so the ref holds one replay's
// Worth however many it has seen. Each recorded conflict is a directory of its images, hashed byte for byte
export const saveResolutions = ({
  branch,
  cwd,
  targetSha,
}: Pick<ReplayInput, "branch" | "cwd" | "targetSha">): void => {
  const directory = readResolutionsDirectory(cwd);
  const conflictEntries = readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (conflictEntries.length === 0) return;

  const treeLines = conflictEntries.map(({ name }) => {
    const imageNames = readdirSync(join(directory, name));
    const blobShas = getNonEmptyLines(
      runGit(
        ["hash-object", "--no-filters", "-w", ...imageNames.map((imageName) => join(directory, name, imageName))],
        cwd,
      ),
    );
    const imageLines = imageNames.map((imageName, index) => `100644 blob ${blobShas[index]}\t${imageName}\n`);
    return `040000 tree ${runGit(["mktree"], cwd, imageLines.join("")).trim()}\t${name}\n`;
  });
  const commitSha = runGit(
    ["commit-tree", runGit(["mktree"], cwd, treeLines.join("")).trim(), "-m", targetSha],
    cwd,
  ).trim();
  runGit(["push", "--quiet", "--force", "origin", `${commitSha}:${RESOLUTIONS_REF_PREFIX}${branch}`], cwd);
};
