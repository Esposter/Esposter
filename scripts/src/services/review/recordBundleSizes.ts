import type { BundleSizeRecordOutcome } from "#src/models/review/BundleSizeRecordOutcome";

import { checkIsPureSizeUpdate } from "#src/services/bundleSizes/checkIsPureSizeUpdate";
import { BUNDLE_SIZE_COMMIT_PREFIX, BUNDLE_SIZES_FILENAME } from "#src/services/bundleSizes/constants";
import { parseBundleSizes } from "#src/services/bundleSizes/parseBundleSizes";
import { readBundleSizes } from "#src/services/bundleSizes/readBundleSizes";
import { renderBundleSizeChanges } from "#src/services/bundleSizes/renderBundleSizeChanges";
import { renderBundleSizes } from "#src/services/bundleSizes/renderBundleSizes";
import { QUEUE_BRANCH, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Writes the record of this checkout's commit when the committed one is stale, as the one writer of it. The record is
// Pushed as a plain push onto that commit, so it lands only while the queue's tip is still that commit: a landing that
// Moved the tip leaves the record to the next run. The dist read here is the build of the commit the workflow named, so
// A checkout moved since then is refused rather than recorded.
export const recordBundleSizes = (): BundleSizeRecordOutcome => {
  const builtCommit = process.env.REVIEW_BUILT_COMMIT ?? "";
  const head = runGit(["rev-parse", "HEAD"]).trim();
  if (head !== builtCommit)
    throw new InvalidOperationError(
      Operation.Read,
      BUNDLE_SIZES_FILENAME,
      `the build was made from ${builtCommit || "no named commit"}, not from the checkout's ${head}`,
    );
  const recordPath = resolve(REPOSITORY_ROOT, BUNDLE_SIZES_FILENAME);
  const committed = readFileSync(recordPath, "utf8");
  const bundleSizes = readBundleSizes(REPOSITORY_ROOT);
  const rendered = renderBundleSizes(bundleSizes);
  if (rendered === committed) return { isCurrent: true, isPushed: false, lines: [] };

  const previous = parseBundleSizes(committed);
  const subject = checkIsPureSizeUpdate(previous, bundleSizes)
    ? `${BUNDLE_SIZE_COMMIT_PREFIX} the record follows the build`
    : `${BUNDLE_SIZE_COMMIT_PREFIX} rows added or removed, read the body`;
  const changes = renderBundleSizeChanges(previous, bundleSizes);
  const body = [
    `The record of ${head}'s build, written by the review that found the committed one stale.`,
    "",
    ...(changes.length > 0 ? changes : ["No row changed size, so the record's rendering changed."]),
  ].join("\n");
  writeFileSync(recordPath, rendered);
  runGit(["add", BUNDLE_SIZES_FILENAME]);
  runGit(["commit", "-m", subject, "-m", body]);
  const commit = runGit(["rev-parse", "--short", "HEAD"]).trim();
  const isPushed = getResult(() => runGit(["push", "origin", `HEAD:refs/heads/${QUEUE_BRANCH}`])).match(
    () => true,
    (error) => {
      console.error(error.message);
      return false;
    },
  );
  // A record not pushed is dropped from the checkout, so a manual run leaves no commit of its own behind
  if (!isPushed) runGit(["reset", "--hard", head]);
  return {
    isCurrent: false,
    isPushed,
    lines: [
      isPushed
        ? `The record was stale, so ${commit} wrote it on the queue's tip, and that push starts the run that reviews it.`
        : "The record was stale, but the queue's tip moved meanwhile, so the next run writes it on the tip then.",
      "",
      ...changes,
    ],
  };
};
