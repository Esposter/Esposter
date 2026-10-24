import { getMemberDescription } from "@/services/message/member/getMemberDescription";
import { describe, expect, test } from "vitest";

describe(getMemberDescription, () => {
  test("has no description for a member the room shows under their own name with no status", () => {
    expect.hasAssertions();

    expect(getMemberDescription({ displayName: "Alice", name: "Alice" }, "")).toBeUndefined();
  });

  test("names the account beside a room display name, then the status message", () => {
    expect.hasAssertions();

    expect(getMemberDescription({ displayName: "Ally", name: "Alice" }, "Away")).toBe("Alice · Away");
  });
});
