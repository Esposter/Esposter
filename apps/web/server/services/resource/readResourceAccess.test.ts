import type { Database } from "@esposter/db-schema";

import { readResourceAccess } from "#server/services/resource/readResourceAccess";
import { describe, expect, test, vi } from "vitest";

describe(readResourceAccess, () => {
  const resourceId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const publishVersion = 1;
  // The two rows that answer the question, each present or absent: an owned, undeleted resource row for a working
  // Copy, and the publication row
  const createDatabase = ({ isOwnedResource, isPublication }: { isOwnedResource: boolean; isPublication: boolean }) => {
    const findFirstResource = vi.fn<() => Promise<undefined | { id: string }>>(() =>
      Promise.resolve(isOwnedResource ? { id: resourceId } : undefined),
    );
    const findFirstPublication = vi.fn<() => Promise<undefined | { publishVersion: number; resourceId: string }>>(() =>
      Promise.resolve(isPublication ? { publishVersion, resourceId } : undefined),
    );
    return {
      db: {
        query: {
          resourcePublicationsInResource: { findFirst: findFirstPublication },
          resourcesInResource: { findFirst: findFirstResource },
        },
      } as unknown as Database,
      findFirstPublication,
      findFirstResource,
    };
  };

  test("reads a resource its caller owns as owned, without asking for its publication", async () => {
    expect.hasAssertions();

    const { db, findFirstPublication } = createDatabase({ isOwnedResource: true, isPublication: false });

    await expect(readResourceAccess(db, resourceId, userId)).resolves.toStrictEqual({ isOwned: true });
    expect(findFirstPublication).not.toHaveBeenCalled();
  });

  test("reads a published resource to a non-owner at the version its publication names", async () => {
    expect.hasAssertions();

    const { db } = createDatabase({ isOwnedResource: false, isPublication: true });

    await expect(readResourceAccess(db, resourceId, userId)).resolves.toStrictEqual({ isOwned: false, publishVersion });
  });

  test("reads an unpublished resource to a non-owner as neither owned nor published", async () => {
    expect.hasAssertions();

    const { db } = createDatabase({ isOwnedResource: false, isPublication: false });

    await expect(readResourceAccess(db, resourceId, userId)).resolves.toStrictEqual({ isOwned: false });
  });

  // The serving endpoint is public, so an anonymous caller reaches here with no user id at all. Nothing can own a
  // Resource on their behalf, so the ownership query is never worth issuing
  test("asks no ownership question of an anonymous caller", async () => {
    expect.hasAssertions();

    const { db, findFirstResource } = createDatabase({ isOwnedResource: true, isPublication: false });

    await expect(readResourceAccess(db, resourceId)).resolves.toStrictEqual({ isOwned: false });
    expect(findFirstResource).not.toHaveBeenCalled();
  });

  // A deleted resource is restorable, so its row survives the delete: the filter is the only thing stopping its
  // Assets from serving out of the recycle bin
  test("excludes a soft-deleted resource from the ownership lookup", async () => {
    expect.hasAssertions();

    const { db, findFirstResource } = createDatabase({ isOwnedResource: false, isPublication: false });
    await readResourceAccess(db, resourceId, userId);

    expect(findFirstResource).toHaveBeenCalledExactlyOnceWith({
      where: { deletedAt: { isNull: true }, id: { eq: resourceId }, userId: { eq: userId } },
    });
  });
});
