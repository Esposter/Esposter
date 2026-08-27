import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(requireUuid, () => {
  const uuid = "00000000-0000-4000-8000-000000000000";

  test("returns the value when it is a v4 uuid", () => {
    expect.hasAssertions();

    expect(requireUuid(uuid, "Entity")).toBe(uuid);
  });

  // The three room builders pass `input[roomIdKey]`, which the generic signature cannot constrain to a string —
  // A schema without a uuid on that key hands this a number, an object or nothing at all
  test.each([[undefined], [""], ["not-a-uuid"], [1], [{}]])(
    "throws TRPCError with code BAD_REQUEST for %o",
    (value) => {
      expect.hasAssertions();

      getResult(() => requireUuid(value, "Entity")).match(noop, (error) => {
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
        expect(error).toStrictEqual(
          expect.objectContaining({
            message: new InvalidOperationError(Operation.Read, "Entity", String(value)).message,
          }),
        );
      });
    },
  );
});
