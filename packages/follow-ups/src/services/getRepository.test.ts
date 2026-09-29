import { getRepository } from "#src/services/getRepository";
import { describe, expect, test } from "vitest";

describe(getRepository, () => {
  const repository = "a/a";

  test.each([
    `https://github.com/${repository}.git`,
    `https://github.com/${repository}`,
    `https://github.com/${repository}/`,
    `git@github.com:${repository}.git`,
    `ssh://git@github.com/${repository}.git\n`,
  ])("reads owner/name from %s", (remoteUrl) => {
    expect.hasAssertions();

    expect(getRepository(remoteUrl)).toBe(repository);
  });

  test("reads nothing from no remote", () => {
    expect.hasAssertions();

    expect(getRepository("")).toBe("");
  });
});
