import { runGit } from "#src/services/coderabbit/shared/runGit";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(runGit, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "run-git-"));
    runGit(["init", "--quiet", directory]);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // Git reads a repository selector from the environment ahead of the cwd, so a hook's exported one would run
  // Every call of the collector — the fixture repository's commits included — against the wrong repository
  test("answers about the cwd while the environment names another repository", () => {
    expect.hasAssertions();

    vi.stubEnv("GIT_DIR", join(mkdtempSync(join(tmpdir(), "run-git-other-")), ".git"));
    vi.stubEnv("GIT_WORK_TREE", directory);

    expect(runGit(["rev-parse", "--absolute-git-dir"], directory).trim()).toContain(directory);
  });
});
