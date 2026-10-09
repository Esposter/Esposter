import { parseForEachRefLine } from "#src/services/fleet/parseForEachRefLine";
import { describe, expect, test } from "vitest";

const SHA = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

describe(parseForEachRefLine, () => {
  test("reads a ref's commit, id and message, a message keeping its spaces", () => {
    expect.hasAssertions();

    expect(parseForEachRefLine(`${SHA} city-areas {"entry":"city-areas", "load":"CPU 4%"}`)).toStrictEqual({
      id: "city-areas",
      message: '{"entry":"city-areas", "load":"CPU 4%"}',
      sha: SHA,
    });
  });

  test("reads a line that is not a commit and its ref as no ref", () => {
    expect.hasAssertions();

    expect(parseForEachRefLine("")).toBeUndefined();
    expect(parseForEachRefLine(`not-a-sha city`)).toBeUndefined();
  });
});
