import { checkIsMainAncestor } from "#src/services/review/checkIsMainAncestor";
import { REMOTE_MAIN_REF, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(checkIsMainAncestor, () => {
  const COMMIT_ARGUMENTS = ["-c", "user.name=Test", "-c", "user.email=test@example.com", "-c", "commit.gpgsign=false"];

  let repositoryPath: string;

  beforeEach(async () => {
    repositoryPath = await mkdtemp(join(tmpdir(), "main-ancestor-"));
  });

  afterEach(async () => {
    await rm(repositoryPath, { force: true, recursive: true });
  });

  // `main` was released past the queue's base and then merged into the queue, so only the merge commit holds it: a queue
  // Commit before the merge does not, and a window ending there cannot move `main`
  test("holds main only from the queue commit that merged it in", () => {
    expect.hasAssertions();

    const readSha = (ref: string): string => runGit(["rev-parse", ref], repositoryPath).trim();
    runGit(["init", "-q", "-b", "queue"], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "base"], repositoryPath);
    const base = readSha("HEAD");
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "queue first"], repositoryPath);
    const queueFirst = readSha("HEAD");
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "queue second"], repositoryPath);
    runGit(["checkout", "-q", "-b", "main", base], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "commit", "-q", "--allow-empty", "-m", "release"], repositoryPath);
    const release = readSha("HEAD");
    runGit(["checkout", "-q", "queue"], repositoryPath);
    runGit([...COMMIT_ARGUMENTS, "merge", "-q", "--no-ff", "-m", "merge main", "main"], repositoryPath);
    const merge = readSha("HEAD");
    runGit(["update-ref", `refs/remotes/${REMOTE_MAIN_REF}`, release], repositoryPath);
    runGit(["update-ref", `refs/remotes/${REMOTE_QUEUE_REF}`, merge], repositoryPath);

    expect(checkIsMainAncestor(queueFirst, repositoryPath)).toBe(false);
    expect(checkIsMainAncestor(merge, repositoryPath)).toBe(true);
  });
});
