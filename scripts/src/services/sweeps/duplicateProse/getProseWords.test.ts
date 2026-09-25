import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { describe, expect, test } from "vitest";

describe(getProseWords, () => {
  test("ends a URL at the closing bracket of the link it sits in", () => {
    expect.hasAssertions();

    expect(getProseWords("[https://a]next")).toStrictEqual(["next"]);
  });

  test("reads a bracketed host as part of its URL", () => {
    expect.hasAssertions();

    expect(getProseWords("http://[::1]/a next")).toStrictEqual(["next"]);
  });
});
