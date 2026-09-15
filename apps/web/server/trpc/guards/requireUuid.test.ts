import type { TRPCError } from "@trpc/server";

import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(requireUuid, () => {
  const name = "name";

  test("returns the value when it is a v4 uuid", () => {
    expect.hasAssertions();

    const uuid = crypto.randomUUID();

    expect(requireUuid(uuid, name)).toBe(uuid);
  });

  test("throws TRPCError with code BAD_REQUEST when the value is not a v4 uuid", () => {
    expect.hasAssertions();

    getResult(() => requireUuid("", name)).match(noop, (error) => {
      expect((error as TRPCError).code).toBe("BAD_REQUEST");
      expect(error).toMatchInlineSnapshot(
        `[TRPCError: ${new InvalidOperationError(Operation.Read, name, "").message}]`,
      );
    });
  });

  test("names a bigint value instead of throwing on it", () => {
    expect.hasAssertions();

    expect(() => requireUuid(1n, name)).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, name, "1").message}]`,
    );
  });
});
