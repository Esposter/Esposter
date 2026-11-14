import { checkHasResourcesKey } from "@/services/resource/checkHasResourcesKey";
import { McpScope } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkHasResourcesKey, () => {
  test("holds for a key ticked with the Resources scope", () => {
    expect.hasAssertions();

    expect(checkHasResourcesKey([{ permissions: { mcp: [McpScope.Resources] } }])).toBe(true);
  });

  test("does not hold for a key ticked with the follow-ups scope alone", () => {
    expect.hasAssertions();

    expect(checkHasResourcesKey([{ permissions: { mcp: [McpScope.FollowUps] } }])).toBe(false);
  });

  test("does not hold for a key with no permissions", () => {
    expect.hasAssertions();

    expect(checkHasResourcesKey([{ permissions: null }])).toBe(false);
  });
});
