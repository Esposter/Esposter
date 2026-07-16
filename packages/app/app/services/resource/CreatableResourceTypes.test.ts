import { isCreatableResourceType } from "@/services/resource/CreatableResourceTypes";
import { describe, expect, test } from "vitest";

describe(isCreatableResourceType, () => {
  test("rejects an unknown string", () => {
    expect.hasAssertions();

    expect(isCreatableResourceType("")).toBe(false);
  });
});
