import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceContentUpdate } from "#server/models/resource/ResourceContentUpdate";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { updateResourceContent } from "#server/services/resource/updateResourceContent";
import { getMockSession } from "#server/trpc/context.test";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { todoListRouter } from "#server/trpc/routers/todoList";
import { STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { beforeAll, describe, expect, test, vi } from "vitest";

describe(updateResourceContent, () => {
  const { getCaller, getMockContext } = setupResourceSuite(todoListRouter);
  let caller: DecorateRouterRecord<TRPCRouter["todoList"]>;
  let ctx: AuthedContext;
  const name = "name";
  const content = { items: [] };

  beforeAll(() => {
    caller = getCaller();
    ctx = { ...getMockContext(), getSessionPayload: getMockSession() };
  });

  // The row handed in is the one read before the owner's save landed, so the update's own save is the stale one
  test("reapplies an unpinned update to the content a save landed in between", async () => {
    expect.hasAssertions();

    const resource = await caller.createResource({ name });
    await caller.saveResourceContent({ content, contentVersion: resource.contentVersion, id: resource.id });
    const update = vi.fn<(storedContent: unknown) => ResourceContentUpdate<unknown>>((storedContent) => ({
      content,
      result: storedContent,
    }));

    const { resource: savedResource, result } = await updateResourceContent(ctx, resource, update);

    expect(update).toHaveBeenCalledTimes(2);
    expect(result).toStrictEqual(content);
    expect(savedResource.contentVersion).toBe(resource.contentVersion + 2);
  });

  test("refuses a pinned update a save landed in between", async () => {
    expect.hasAssertions();

    const resource = await caller.createResource({ name });
    await caller.saveResourceContent({ content, contentVersion: resource.contentVersion, id: resource.id });
    const update = vi.fn<(storedContent: unknown) => ResourceContentUpdate<unknown>>(() => ({
      content,
      result: undefined,
    }));

    await expect(
      updateResourceContent(ctx, resource, update, resource.contentVersion),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${STALE_CONTENT_VERSION_ERROR_MESSAGE}]`);
    expect(update).toHaveBeenCalledTimes(1);
  });
});
