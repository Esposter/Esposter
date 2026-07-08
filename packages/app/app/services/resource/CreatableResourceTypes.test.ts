import { CreatableResourceTypes, isCreatableResourceType } from "@/services/resource/CreatableResourceTypes";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(isCreatableResourceType, () => {
  test("accepts every creatable type", () => {
    for (const type of CreatableResourceTypes) expect(isCreatableResourceType(type)).toBe(true);
  });

  test("rejects types without an explorer create path", () => {
    expect(isCreatableResourceType(ResourceType.Survey)).toBe(false);
    expect(isCreatableResourceType(ResourceType.File)).toBe(false);
    expect(isCreatableResourceType(ResourceType.TodoList)).toBe(false);
  });

  test("rejects an unknown string", () => {
    expect(isCreatableResourceType("nonsense")).toBe(false);
  });
});
