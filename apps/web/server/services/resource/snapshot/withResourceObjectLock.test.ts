import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import {
  releaseResourceObjectLock,
  tryAcquireResourceObjectLock,
} from "#server/services/resource/snapshot/withResourceObjectLock";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { resourceObjectLocksInResource, resourcesInResource, ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe(tryAcquireResourceObjectLock, () => {
  const firstHolder = "first";
  const secondHolder = "second";
  let db: Context["db"];
  let resource: ResourceInResource;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    db = mockContext.db;
    resource = takeOne(
      await db
        .insert(resourcesInResource)
        .values({ name: "name", type: ResourceType.Webpage, userId: getMockSession().user.id })
        .returning(),
    );
  });

  afterEach(async () => {
    await db.delete(resourceObjectLocksInResource);
  });

  test("refuses a second holder while the first holds the lease, and a release by anyone but the holder changes nothing", async () => {
    expect.hasAssertions();

    expect(await tryAcquireResourceObjectLock(db, resource.id, firstHolder)).toBe(true);
    expect(await tryAcquireResourceObjectLock(db, resource.id, secondHolder)).toBe(false);

    await releaseResourceObjectLock(db, resource.id, secondHolder);
    expect(await tryAcquireResourceObjectLock(db, resource.id, secondHolder)).toBe(false);

    await releaseResourceObjectLock(db, resource.id, firstHolder);
    expect(await tryAcquireResourceObjectLock(db, resource.id, secondHolder)).toBe(true);
  });

  test("takes over a lease whose holder never released it once it has expired, and refuses the expired holder's release", async () => {
    expect.hasAssertions();

    expect(await tryAcquireResourceObjectLock(db, resource.id, firstHolder)).toBe(true);
    await db
      .update(resourceObjectLocksInResource)
      .set({ expiresAt: new Date(0) })
      .where(eq(resourceObjectLocksInResource.resourceId, resource.id));

    expect(await tryAcquireResourceObjectLock(db, resource.id, secondHolder)).toBe(true);
    await releaseResourceObjectLock(db, resource.id, firstHolder);
    expect(await tryAcquireResourceObjectLock(db, resource.id, firstHolder)).toBe(false);
  });
});
