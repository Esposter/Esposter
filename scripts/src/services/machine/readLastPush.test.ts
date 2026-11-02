import { readLastPush } from "#src/services/machine/readLastPush";
import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { runGit } from "#src/services/shared/runGit";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readLastPush, () => {
  let repositoryRoot = "";

  beforeEach(() => {
    repositoryRoot = mkdtempSync(join(tmpdir(), "read-last-push-"));
    runGit(["init", "--quiet"], repositoryRoot);
    runGit(["config", "user.name", "Jim"], repositoryRoot);
    runGit(["config", "user.email", "jim@example.com"], repositoryRoot);
  });

  afterEach(() => {
    rmSync(repositoryRoot, { force: true, recursive: true });
  });

  const createCommit = (name: string, email: string) => {
    runGit(
      [
        "-c",
        `user.name=${name}`,
        "-c",
        `user.email=${email}`,
        "commit",
        "--allow-empty",
        "--quiet",
        "-m",
        TEST_FILENAME,
      ],
      repositoryRoot,
    );
  };

  // `--author` matches a substring of the author line, so a commit by a longer name that contains this one is not this
  // Identity's, and neither is one by the same name under another email
  test("reports the newest commit by this name and this email, not one by a name that contains it", () => {
    expect.hasAssertions();

    createCommit("Jim", "jim@example.com");
    const expectedSha = runGit(["rev-parse", "HEAD"], repositoryRoot).trim();
    createCommit("Jim", "jim@example.org");
    createCommit("Jimmy Chen", "jimmy@example.com");
    runGit(["update-ref", `refs/remotes/${REMOTE_QUEUE_REF}`, "HEAD"], repositoryRoot);

    expect(readLastPush(repositoryRoot)?.sha).toBe(expectedSha);
  });
});
