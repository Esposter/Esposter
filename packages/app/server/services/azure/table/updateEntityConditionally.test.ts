import type { AzureUpdateEntity, CustomTableClient } from "@esposter/db-schema";

import { updateEntityConditionally } from "@@/server/services/azure/table/updateEntityConditionally";
import { AzureEntityType, StandardMessageEntity } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

type WriteEntity = (entity: AzureUpdateEntity<StandardMessageEntity>, etag: string) => Promise<unknown>;

const getTableClient = (getEntityImplementation: () => Promise<Record<string, unknown>>) =>
  ({ getEntity: getEntityImplementation }) as unknown as CustomTableClient<StandardMessageEntity>;

describe(updateEntityConditionally, () => {
  const partitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  const concurrentMessage = "concurrentMessage";
  const getEntity = (entityMessage: string) =>
    Object.assign(new StandardMessageEntity(), { message: entityMessage, partitionKey, rowKey });
  // The stored record as the SDK hands it back — the etag rides alongside the entity's own properties
  const getEntityRecord = (entityMessage: string, etag: string) => ({
    etag,
    message: entityMessage,
    partitionKey,
    rowKey,
  });
  // Every caller's intent is "derive the new body from whichever version I am writing against", so the test's
  // Intent is the same shape: append to the message it was handed
  const getUpdateEntity = ({
    message: entityMessage,
  }: StandardMessageEntity): AzureUpdateEntity<StandardMessageEntity> => ({
    message: `${entityMessage}!`,
    partitionKey,
    rowKey,
  });

  test("re-applies the intent to the version it re-read rather than the one it started from", async () => {
    expect.hasAssertions();

    const writeEntity = vi.fn<WriteEntity>().mockRejectedValueOnce(new Error("412")).mockResolvedValueOnce(undefined);
    const updatedEntity = await updateEntityConditionally(
      getTableClient(() => Promise.resolve(getEntityRecord(concurrentMessage, "2"))),
      StandardMessageEntity,
      {
        entityType: AzureEntityType.Message,
        entityWithEtag: { entity: getEntity(message), etag: "1" },
        getUpdateEntity,
        writeEntity,
      },
    );

    expect(writeEntity).toHaveBeenCalledTimes(2);
    // The losing attempt computed from the version it read, the winning one from the version that replaced it
    expect(writeEntity.mock.calls[0]?.[0].message).toBe(`${message}!`);
    expect(writeEntity.mock.calls[0]?.[1]).toBe("1");
    expect(writeEntity.mock.calls[1]?.[0].message).toBe(`${concurrentMessage}!`);
    expect(writeEntity.mock.calls[1]?.[1]).toBe("2");
    expect(updatedEntity.message).toBe(`${concurrentMessage}!`);
  });

  // An unchanged version means the write failed for something retrying cannot fix, so degrading it to CONFLICT
  // Would report the wrong cause
  test("rethrows the write error when the version has not moved", async () => {
    expect.hasAssertions();

    const writeEntity = vi.fn<WriteEntity>(() => Promise.reject(new Error("failure")));

    await expect(
      updateEntityConditionally(
        getTableClient(() => Promise.resolve(getEntityRecord(message, "1"))),
        StandardMessageEntity,
        {
          entityType: AzureEntityType.Message,
          entityWithEtag: { entity: getEntity(message), etag: "1" },
          getUpdateEntity,
          writeEntity,
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: failure]`);
  });

  test("throws NOT_FOUND when the entity is gone by the time it re-reads", async () => {
    expect.hasAssertions();

    const writeEntity = vi.fn<WriteEntity>(() => Promise.reject(new Error("412")));

    await expect(
      updateEntityConditionally(
        getTableClient(() => Promise.reject(new Error("404"))),
        StandardMessageEntity,
        {
          entityType: AzureEntityType.Message,
          entityWithEtag: { entity: getEntity(message), etag: "1" },
          getUpdateEntity,
          writeEntity,
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(AzureEntityType.Message, JSON.stringify({ partitionKey, rowKey })).message}]`,
    );
  });

  // Bounded, so an entity being rewritten faster than the caller can land is refused rather than retried forever
  test("throws CONFLICT when every attempt loses the race", async () => {
    expect.hasAssertions();

    const writeEntity = vi.fn<WriteEntity>(() => Promise.reject(new Error("412")));
    let etag = 1;

    await expect(
      updateEntityConditionally(
        getTableClient(() => {
          etag += 1;
          return Promise.resolve(getEntityRecord(concurrentMessage, String(etag)));
        }),
        StandardMessageEntity,
        {
          entityType: AzureEntityType.Message,
          entityWithEtag: { entity: getEntity(message), etag: "1" },
          getUpdateEntity,
          writeEntity,
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: CONFLICT]`);
    expect(writeEntity).toHaveBeenCalledTimes(3);
  });
});
