import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(requireUuid, () => {
  const name = "Entity";

  test("returns the value when it is a v4 uuid", () => {
    expect.hasAssertions();

    const uuid = "00000000-0000-4000-8000-000000000000";

    expect(requireUuid(uuid, name)).toBe(uuid);
  });

  test("throws TRPCError with code BAD_REQUEST when the value is not a v4 uuid", () => {
    expect.hasAssertions();

    getResult(() => requireUuid("not-a-uuid", name)).match(noop, (error) => {
      expect((error as TRPCError).code).toBe("BAD_REQUEST");
      expect(error).toMatchInlineSnapshot(
        `[TRPCError: ${new InvalidOperationError(Operation.Read, name, "not-a-uuid").message}]`,
      );
    });
  });

  test("names a bigint value instead of throwing on it", () => {
    expect.hasAssertions();

    getResult(() => requireUuid(1n, name)).match(noop, (error) => {
      expect(error).toMatchInlineSnapshot(
        `[TRPCError: ${new InvalidOperationError(Operation.Read, name, "1").message}]`,
      );
    });
  });
});
