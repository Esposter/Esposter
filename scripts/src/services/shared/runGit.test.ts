import { runGit } from "#src/services/shared/runGit";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(runGit, () => {
  let directory: string;
  let otherDirectory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "run-git-"));
    otherDirectory = mkdtempSync(join(tmpdir(), "run-git-other-"));
    runGit(["init", "--quiet", directory]);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
    rmSync(otherDirectory, { force: true, recursive: true });
  });

  // Git reads a repository selector from the environment ahead of the cwd, so a hook's exported one would run
  // Every call of the collector — the fixture repository's commits included — against the wrong repository, and
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
});
