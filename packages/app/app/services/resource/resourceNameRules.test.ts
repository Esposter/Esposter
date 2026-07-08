import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("resourceNameRules", () => {
  const rule = takeOne(resourceNameRules);

  test("accepts a valid name", () => {
    expect(rule("My Resource")).toBe(true);
  });

  test("returns an error message for an empty name", () => {
    expect(rule("")).toBeTypeOf("string");
  });
});
