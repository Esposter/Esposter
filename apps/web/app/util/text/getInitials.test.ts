import { getInitials } from "@/util/text/getInitials";
import { describe, expect, test } from "vitest";

describe(getInitials, () => {
  test("takes the initials of the first and last names only", () => {
    expect.hasAssertions();

    expect(getInitials("")).toBe("");
    expect(getInitials("a")).toBe("A");
    expect(getInitials("a a")).toBe("AA");
    expect(getInitials("a b c")).toBe("AC");
  });
});
