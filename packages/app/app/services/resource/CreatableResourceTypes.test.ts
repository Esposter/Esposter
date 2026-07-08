import { CreatableResourceTypes, isCreatableResourceType } from "@/services/resource/CreatableResourceTypes";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(isCreatableResourceType, () => {
  test("accepts every creatable type", () => {
    expect.hasAssertions();

    for (const type of CreatableResourceTypes) expect(isCreatableResourceType(type)).toBe(true);
  });

  test("rejects types without an explorer create path", () => {
    expect.hasAssertions();

    expect(isCreatableResourceType(ResourceType.Survey)).toBe(false);
    expect(isCreatableResourceType(ResourceType.File)).toBe(false);
    expect(isCreatableResourceType(ResourceType.TodoList)).toBe(false);
  });

  test("rejects an unknown string", () => {
    expect.hasAssertions();

    expect(isCreatableResourceType("")).toBe(false);
  });
});
