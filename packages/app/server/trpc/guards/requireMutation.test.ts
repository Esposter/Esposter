import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(requireMutation, () => {
  test("returns result when defined", () => {
    expect.hasAssertions();

    const result = { id: "" };
    const returned = requireMutation(result, Operation.Create, "Entity", "");

    expect(returned).toBe(result);
  });

  test("throws TRPCError with code BAD_REQUEST when result is undefined (default)", () => {
    expect.hasAssertions();

    expect(() => {
      requireMutation(undefined, Operation.Create, "Entity", "1");
    }).toThrowErrorMatchingInlineSnapshot(`[TRPCError: Invalid Operation: Create Entity 1]`);
  });

  test("throws TRPCError with code NOT_FOUND when result is undefined and code param is NOT_FOUND", () => {
    expect.hasAssertions();

    expect(() => {
      requireMutation(undefined, Operation.Create, "Entity", "1", "NOT_FOUND");
    }).toThrowErrorMatchingInlineSnapshot(`[TRPCError: Invalid Operation: Create Entity 1]`);
  });
});
