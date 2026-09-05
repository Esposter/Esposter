import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { getResultAsync, noop, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(requireEntity, () => {
  test("returns the entity when the query resolves with one", async () => {
    expect.hasAssertions();

    const entity = { id: "" };
    const returnedEntity = await requireEntity(Promise.resolve(entity), "Entity", "");

    expect(returnedEntity).toBe(entity);
  });

  test("throws TRPCError with code NOT_FOUND when the query resolves with undefined", async () => {
    expect.hasAssertions();

    await getResultAsync(() => requireEntity(Promise.resolve(undefined), "Entity", "1")).match(noop, (error) => {
      expect((error as TRPCError).code).toBe("NOT_FOUND");
      expect(error).toMatchInlineSnapshot(`[TRPCError: ${new NotFoundError("Entity", "1").message}]`);
    });
  });
});
