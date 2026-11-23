import { BUNDLE_SIZE_COMMIT_PREFIX, BUNDLE_SIZES_FILENAME } from "#src/services/bundleSizes/constants";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// Whether a commit is one the review wrote for the record: it changes the record file and nothing else, under the
// Subject `recordBundleSizes` gives every record commit. A session never writes the record, so no other commit has that
// Shape.
export const checkIsRecordCommit = (sha: string): boolean => {
  const files = runGit(["diff-tree", "--no-commit-id", "--name-only", "-r", sha]).trim().split("\n");
  const subject = runGit(["log", "-1", "--format=%s", sha]).trim();
  return (
    files.length === 1 && takeOne(files, 0) === BUNDLE_SIZES_FILENAME && subject.startsWith(BUNDLE_SIZE_COMMIT_PREFIX)
  );
};
