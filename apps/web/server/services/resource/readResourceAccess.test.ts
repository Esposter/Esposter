import { readResourceAccess } from "#server/services/resource/readResourceAccess";
import { createMockDb } from "@esposter/db-mock";
import {
  resourcePublicationsInResource,
  resourcesInResource,
  ResourceType,
  resourceVersionsInResource,
  SnapshotChannel,
  usersInAuth,
} from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readResourceAccess, () => {
  const resourceId = v7();
  const userId = v7();
  const publishVersion = 1;
  // The rows the answer reads, in a real database, so each case asks the queries production runs: the resource's owner,
  // The resource itself (a deleted one keeps its row), and its publication at the version it names
  const seedDatabase = async ({
    isDeleted = false,
    isPublished,
    ownerId,
  }: {
    isDeleted?: boolean;
    isPublished: boolean;
    ownerId: string;
  }) => {
    const { db } = await createMockDb();
    const createdAt = new Date(0);
    await db
      .insert(usersInAuth)
      .values({
        biography: "",
        createdAt,
        email: "email",
        emailVerified: true,
        id: ownerId,
        name: "name",
        updatedAt: createdAt,
      });
    await db
      .insert(resourcesInResource)
      .values({
        deletedAt: isDeleted ? createdAt : null,
        id: resourceId,
        name: "name",
        type: ResourceType.Webpage,
        userId: ownerId,
      });
    if (isPublished) {
      await db
        .insert(resourceVersionsInResource)
        .values({
          channel: SnapshotChannel.Published,
          hash: "",
          plaintextBytes: 0,
          resourceId,
          storedBytes: 0,
          version: publishVersion,
        });
      await db.insert(resourcePublicationsInResource).values({ publishVersion, resourceId });
    }
    return db;
  };

  afterEach(async () => {
    await (await createMockDb()).reset();
    vi.restoreAllMocks();
  });

  test("reads a resource its caller owns as owned, without asking for its publication", async () => {
    expect.hasAssertions();

    const db = await seedDatabase({ isPublished: false, ownerId: userId });
    const select = vi.spyOn(db, "select");

    await expect(readResourceAccess(db, resourceId, userId)).resolves.toStrictEqual({ isOwned: true });
    expect(select).not.toHaveBeenCalled();
  });

  test("reads a published resource to a non-owner at the version its publication names", async () => {
    expect.hasAssertions();

    const db = await seedDatabase({ isPublished: true, ownerId: v7() });

    await expect(readResourceAccess(db, resourceId, userId)).resolves.toStrictEqual({ isOwned: false, publishVersion });
  });

  test("reads an unpublished resource to a non-owner as neither owned nor published", async () => {
    expect.hasAssertions();

    const db = await seedDatabase({ isPublished: false, ownerId: v7() });

    await expect(readResourceAccess(db, resourceId, userId)).resolves.toStrictEqual({ isOwned: false });
  });

  // The serving endpoint is public, so an anonymous caller reaches here with no user id at all. Nothing can own a
  // Resource on their behalf, so the ownership query is never worth issuing
  test("asks no ownership question of an anonymous caller", async () => {
    expect.hasAssertions();

    const db = await seedDatabase({ isPublished: false, ownerId: userId });
    const findFirstResource = vi.spyOn(db.query.resourcesInResource, "findFirst");

    await expect(readResourceAccess(db, resourceId)).resolves.toStrictEqual({ isOwned: false });
    expect(findFirstResource).not.toHaveBeenCalled();
  });

  // A deleted resource is restorable, so its row survives the delete: the filter is the only thing stopping its
  // Assets from serving out of the recycle bin
  test("excludes a soft-deleted resource from the ownership lookup", async () => {
    expect.hasAssertions();

    const db = await seedDatabase({ isDeleted: true, isPublished: false, ownerId: userId });

    await expect(readResourceAccess(db, resourceId, userId)).resolves.toStrictEqual({ isOwned: false });
  });
});
