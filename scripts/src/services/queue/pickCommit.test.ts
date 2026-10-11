import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { pickCommit } from "#src/services/queue/pickCommit";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(pickCommit, () => {
  const { commitFile, getCwd, readSha, switchTo } = setupFixtureRepository();

  test("skips a commit whose change the checkout already carries, leaving no pick open", () => {
    expect.hasAssertions();

    const base = readSha("HEAD");
    const commit = commitFile("a", "a");
    switchTo(base);
    const landed = commitFile("a", "a");

    expect(pickCommit(commit, getCwd())).toBe(true);
    expect(readSha("HEAD")).toBe(landed);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });

  test("leaves a conflicting pick open", () => {
    expect.hasAssertions();

    const base = readSha("HEAD");
    const commit = commitFile("a", "a");
    switchTo(base);
    commitFile("a", "b");

    expect(pickCommit(commit, getCwd())).toBe(false);
    expect(runGit(["diff", "--name-only", "--diff-filter=U"], getCwd())).toBe("a\n");
  });
});
