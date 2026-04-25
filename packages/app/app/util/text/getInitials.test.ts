import { getInitials } from "@/util/text/getInitials";
import { describe, expect, test } from "vitest";

describe(getInitials, () => {
  test("gets", () => {
    expect.hasAssertions();

    expect(getInitials("")).toBe("");
    expect(getInitials("a")).toBe("A");
    expect(getInitials("a a")).toBe("AA");
  });
});
