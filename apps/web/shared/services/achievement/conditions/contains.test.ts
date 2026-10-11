import { contains } from "#shared/services/achievement/conditions/contains";
import { describe, expect, test } from "vitest";

describe(contains, () => {
  test("matches a substring regardless of case, and an absent value never", () => {
    expect.hasAssertions();

    const hasLink = contains("http");

    expect(hasLink("See HTTP://x")).toBe(true);
    expect(hasLink("plain")).toBe(false);
    expect(hasLink(undefined)).toBe(false);
  });
});
