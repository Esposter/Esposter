import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getResult, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
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

    getResult(() => requireMutation(undefined, Operation.Create, "Entity", "1")).match(noop, (err) => {
      expect(err).toBeInstanceOf(TRPCError);
      expect((err as TRPCError).code).toBe("BAD_REQUEST");
      expect(err).toMatchInlineSnapshot(`[TRPCError: Invalid operation: Create, name: Entity, 1]`);
    });
  });

  test("throws TRPCError with code NOT_FOUND when result is undefined and code param is NOT_FOUND", () => {
    expect.hasAssertions();

    getResult(() => requireMutation(undefined, Operation.Create, "Entity", "1", "NOT_FOUND")).match(noop, (err) => {
      expect(err).toBeInstanceOf(TRPCError);
      expect((err as TRPCError).code).toBe("NOT_FOUND");
      expect(err).toMatchInlineSnapshot(`[TRPCError: Invalid operation: Create, name: Entity, 1]`);
    });
  });
});
