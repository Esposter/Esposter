import type { Database } from "@esposter/db-schema";

import { purgePreCutoverResources } from "#src/services/resource/purgePreCutoverResources";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { resourcesInResource, ResourceType, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));
vi.mock(
  import("#src/services/azure/getWebPubSubServiceClient"),
  () => import("#src/services/azure/getWebPubSubServiceClient.test"),
);

describe(purgePreCutoverResources, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const userId = crypto.randomUUID();
  const name = "name";
  // Rows created before the cutover are the epoch's; the cutover itself is a day later, and a row created at it is not one
  const cutoff = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
  const preCutoverDate = new Date(0);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockDb.delete(resourcesInResource);
    await mockDb.delete(storageLedgerInStorage);
    await mockDb.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  const insertResource = async (type: ResourceType, createdAt: Date, deletedAt: Date | null) =>
    takeOne(await mockDb.insert(resourcesInResource).values({ createdAt, deletedAt, name, type, userId }).returning());

  test("A count confirms the purge removed every pre-cutover row", async () => {
    expect.hasAssertions();

    // The migration bins each pre-cutover row at the epoch, which the purge's retention has long passed
    await insertResource(ResourceType.Webpage, preCutoverDate, preCutoverDate);
    await insertResource(ResourceType.Email, preCutoverDate, preCutoverDate);
    const postCutoverWebpage = await insertResource(ResourceType.Webpage, cutoff, null);

    const remainingPreCutoverCount = await purgePreCutoverResources(context, cutoff);
    const remainingRows = await mockDb.select({ id: resourcesInResource.id }).from(resourcesInResource);

    expect(remainingPreCutoverCount).toBe(0);
    // A row created at the cutover is a post-cutover one, so the purge leaves it alone
    expect(remainingRows.map(({ id }) => id)).toStrictEqual([postCutoverWebpage.id]);
  });

  test("A pre-cutover row the purge does not reach is still counted", async () => {
    expect.hasAssertions();

    await insertResource(ResourceType.Email, preCutoverDate, null);

    await expect(purgePreCutoverResources(context, cutoff)).resolves.toBe(1);
  });
});
