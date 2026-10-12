import { runGit } from "#src/services/shared/runGit";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(runGit, () => {
  let directory: string;
  let otherDirectory: string;

  beforeEach(() => {
    // The temporary directory is resolved, since macOS reaches it through a symlink git answers past
    directory = realpathSync(mkdtempSync(join(tmpdir(), "run-git-")));
    otherDirectory = mkdtempSync(join(tmpdir(), "run-git-other-"));
    runGit(["init", "--quiet", directory]);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
    rmSync(otherDirectory, { force: true, recursive: true });
  });

  // Git reads a repository selector from the environment ahead of the cwd, so a hook's exported one would run
  // Every call of a script — the fixture repository's commits included — against the wrong repository, and
  // An ambient object store would leave the objects it writes there rather than in the repository it named
  test("answers about the cwd while the environment names another repository", () => {
    expect.hasAssertions();

    vi.stubEnv("GIT_COMMON_DIR", otherDirectory);
    vi.stubEnv("GIT_DIR", join(otherDirectory, ".git"));
    vi.stubEnv("GIT_OBJECT_DIRECTORY", join(otherDirectory, "objects"));
    vi.stubEnv("GIT_WORK_TREE", directory);

    // Git prints forward slashes on every platform, so the fixture paths are compared in the same spelling
    const [gitDirectory, objectsDirectory] = [
      runGit(["rev-parse", "--absolute-git-dir"], directory),
      runGit(["rev-parse", "--git-path", "objects"], directory),
    ].map((output) => output.trim().replaceAll("\\", "/"));

    expect(gitDirectory).toBe(`${directory.replaceAll("\\", "/")}/.git`);
    expect(objectsDirectory).toBe(".git/objects");
  });

  // An SSH session across a sleep or a dropped network stays connected and never answers, holding an unbounded call
  // For hours. The stand-in transport outlasts the bound, and its `#` comments out the host and the remote command git
  // Appends to it
  test("fails at its timeout against a remote that never answers", () => {
    expect.hasAssertions();

    vi.stubEnv("GIT_SSH_COMMAND", "sleep 10 #");

    expect(() =>
      runGit(
        ["ls-remote", "ssh://a/"],
        directory,
        undefined,
        Temporal.Duration.from({ seconds: 1 }).total("milliseconds"),
      ),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: spawnSync git ETIMEDOUT]`);
  });
});
