import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { ContainerClient } from "@azure/storage-blob";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { deleteCreatedResources } from "@@/server/services/resource/deleteCreatedResources";
import { createEntity } from "@esposter/db";
import {
  AzureTable,
  getReverseTickedTimestamp,
  ResourceActivityEntity,
  ResourceActivityType,
} from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { MockContainerClient, MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { containerClientMock } = vi.hoisted(() => ({
  containerClientMock: {} as { current: ContainerClient },
}));

vi.mock(import("@@/server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

// Only the row delete is asked of the database here, so the where clause it is handed is the whole contract
const createContext = () => {
  const where = vi.fn<() => Promise<void>>(() => Promise.resolve());
  return { ctx: { db: { delete: () => ({ where }) } } as unknown as AuthedContext, where };
};

const readActivityCount = async () => {
  const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
  let count = 0;
  for await (const _entity of resourceActivityClient.listEntities()) count++;
  return count;
};

describe(deleteCreatedResources, () => {
  const resourceId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const createActivity = async () => {
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    await createEntity(
      resourceActivityClient,
      new ResourceActivityEntity({
        activityType: ResourceActivityType.Created,
        partitionKey: resourceId,
        rowKey: getReverseTickedTimestamp(),
        userId,
      }),
    );
  };

  beforeEach(() => {
    containerClientMock.current = new MockContainerClient("", "resource-assets") as unknown as ContainerClient;
  });

  afterEach(() => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    vi.restoreAllMocks();
  });

  // The trail is opened at insert time so no create path can forget it, which leaves the rollback holding an
  // Entry nothing can reach once the row it is read through is gone
  test("drops the created resource's activity trail with its row", async () => {
    expect.hasAssertions();

    await createActivity();
    const { ctx, where } = createContext();
    await deleteCreatedResources(ctx, [resourceId]);

    await expect(readActivityCount()).resolves.toBe(0);
    expect(where).toHaveBeenCalledTimes(1);
  });

  // The caller is already failing for its own reason, and a rollback that stops at its first failed step leaves
  // Behind the half-created resource it exists to remove
  test("deletes the row even when the blob cleanup fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(noop);
    containerClientMock.current = {
      listBlobsFlat: () => {
        throw new Error("boom");
      },
    } as unknown as ContainerClient;
    await createActivity();
    const { ctx, where } = createContext();
    await deleteCreatedResources(ctx, [resourceId]);

    await expect(readActivityCount()).resolves.toBe(0);
    expect(where).toHaveBeenCalledTimes(1);
  });

  test("asks for nothing when no resource was created", async () => {
    expect.hasAssertions();

    const { ctx, where } = createContext();
    await deleteCreatedResources(ctx, []);

    expect(where).not.toHaveBeenCalled();
  });
});
