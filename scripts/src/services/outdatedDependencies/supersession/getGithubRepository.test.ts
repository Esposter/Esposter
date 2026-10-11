import { getGithubRepository } from "#src/services/outdatedDependencies/supersession/getGithubRepository";
import { describe, expect, test } from "vitest";

describe(getGithubRepository, () => {
  test("reads owner and repo from a git URL, dropping the .git suffix", () => {
    expect.hasAssertions();

    expect(getGithubRepository("git+https://github.com/unjs/radix3.git")).toBe("unjs/radix3");
  });

  test("returns nothing for a repository that is not on GitHub", () => {
    expect.hasAssertions();

    expect(getGithubRepository("https://gitlab.com/unjs/radix3")).toBe("");
  });
});
