import { CreatableResourceTypes, isCreatableResourceType } from "@/services/resource/CreatableResourceTypes";
import { describe, expect, test } from "vitest";

describe(isCreatableResourceType, () => {
  test("accepts every creatable type", () => {
    expect.hasAssertions();

    for (const type of CreatableResourceTypes) expect(isCreatableResourceType(type)).toBe(true);
  });

  test("rejects an unknown string", () => {
    expect.hasAssertions();

    expect(isCreatableResourceType("")).toBe(false);
  });
});
