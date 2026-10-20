import type { ReviewRange } from "#src/models/review/ReviewRange";

import { ReviewMode } from "#src/models/review/ReviewMode";
import { readOwedShas } from "#src/services/review/readOwedShas";
import { runGit } from "#src/services/shared/runGit";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const COMMIT_ARGUMENTS = ["-c", "user.name=Test", "-c", "user.email=test@example.com", "-c", "commit.gpgsign=false"];

describe(readOwedShas, () => {
  let repositoryPath: string;

  beforeEach(async () => {
    repositoryPath = await mkdtemp(join(tmpdir(), "owed-shas-"));
  });

  afterEach(async () => {
    await rm(repositoryPath, { force: true, recursive: true });
  });

  // `main` is reached from `ai/queue` only through a merge's second parent, so the first-parent line never meets it
  test("reads every commit the queue adds past main, even when main is merged in", () => {
    expect.hasAssertions();

    runGit(["init", "-q", "-b", "main"], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "base"], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "main"], repositoryPath);
    runGit(["checkout", "-q", "-b", "queue", "HEAD~1"], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "queue first"], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "merge", "-q", "--no-ff", "-m", "merge main", "main"], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "queue second"], repositoryPath);

    const range: ReviewRange = { from: "main", mode: ReviewMode.Steady, to: "queue" };

    expect(readOwedShas(range, repositoryPath)).toStrictEqual([
      runGit(["rev-parse", "queue~2"], repositoryPath).trim(),
      runGit(["rev-parse", "queue~1"], repositoryPath).trim(),
      runGit(["rev-parse", "queue"], repositoryPath).trim(),
    ]);
  });
});
