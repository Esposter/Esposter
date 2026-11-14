import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";
import type { R2Bucket } from "@cloudflare/workers-types";

import { deleteCreatedResources } from "#server/services/resource/deleteCreatedResources";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { createMockBucket } from "@esposter/db-mock";
import {
  resourceActivitiesInResource,
  ResourceActivityType,
  resourcesInResource,
  ResourceType,
  StorageBucket,
} from "@esposter/db-schema";
import { noop, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { bucketMock } = vi.hoisted(() => ({ bucketMock: {} as { current: R2Bucket } }));

vi.mock(import("#server/services/storage/getBucket"), () => ({ getBucket: () => bucketMock.current }));

describe(deleteCreatedResources, () => {
  const name = "name";
  let mockContext: Context;
  let ctx: AuthedContext;
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;
  const createResource = async () =>
    takeOne(
      await mockContext.db
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Webpage, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  const createActivity = async (resourceId: string) => {
    await mockContext.db
      .insert(resourceActivitiesInResource)
      .values({ activityType: ResourceActivityType.Created, resourceId });
  };
  const readActivityIds = (resourceId: string) =>
    mockContext.db
      .select({ id: resourceActivitiesInResource.id })
      .from(resourceActivitiesInResource)
      .where(eq(resourceActivitiesInResource.resourceId, resourceId));
  const readResourceRow = (resourceId: string) =>
    mockContext.db.query.resourcesInResource.findFirst({ where: { id: { eq: resourceId } } });

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
  });

  beforeEach(() => {
    bucketMock.current = bucket;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    // The row's delete cascades to the activity trail, so clearing the rows clears the trail too
    await mockContext.db.delete(resourcesInResource);
  });

  afterAll(async () => {
    await dispose();
  });

  // The trail opened at insert time goes with its row, so the rollback leaves no entry that no read can reach
  test("drops the created resource's activity trail with its row", async () => {
    expect.hasAssertions();

    const resource = await createResource();
    await createActivity(resource.id);
    await deleteCreatedResources(ctx, [resource.id]);

    await expect(readActivityIds(resource.id)).resolves.toStrictEqual([]);
    await expect(readResourceRow(resource.id)).resolves.toBeUndefined();
  });

  // The caller is already failing for its own reason, and a rollback that stops at its first failed step leaves
  // Behind the half-created resource it exists to remove
  test("deletes the row even when the blob cleanup fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(noop);
    bucketMock.current = {
      list: () => {
        throw new Error(" ");
      },
    } as unknown as R2Bucket;
    const resource = await createResource();
    await createActivity(resource.id);
    await deleteCreatedResources(ctx, [resource.id]);

    await expect(readActivityIds(resource.id)).resolves.toStrictEqual([]);
    await expect(readResourceRow(resource.id)).resolves.toBeUndefined();
  });

  test("asks for nothing when no resource was created", async () => {
    expect.hasAssertions();

    const resource = await createResource();
    const rowBefore = await readResourceRow(resource.id);
    await deleteCreatedResources(ctx, []);

    await expect(readResourceRow(resource.id)).resolves.toStrictEqual(rowBefore);
  });
});
