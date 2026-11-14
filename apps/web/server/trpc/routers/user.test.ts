import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { BlobDeletionQueueMessage } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockSession } from "#server/auth.test";
import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { getCallBackgroundBlobName } from "#server/services/message/call/getCallBackgroundBlobName";
import { getCallBackgroundPrefix } from "#server/services/message/call/getCallBackgroundPrefix";
import { MockJobQueue, MockJobQueueDatabase } from "#server/services/queue/getJobQueue.test";
import { getBucket } from "#server/services/storage/getBucket";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { DATA_EXPORT_LINK_DURATION_MS } from "#server/services/user/constants";
import { createCallerFactory } from "#server/trpc";
import {
  createMockContext,
  createMockUser,
  getMockCreateApiKey,
  getMockRevokeSession,
  getMockSession,
  mockNoSessionOnce,
  mockSessionOnce,
} from "#server/trpc/context.test";
import { userRouter } from "#server/trpc/routers/user";
import { MimeType } from "#shared/models/file/MimeType";
import { MAX_CALL_BACKGROUND_SIZE_BYTES, MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { deleteDirectory } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  DatabaseEntityType,
  dataExportsInUser,
  DataExportStatus,
  McpScope,
  QueueJob,
  sessionsInAuth,
  StorageBucket,
  UserStatus,
  userStatusesInMessage,
  WRITE_SAS_DURATION_MS,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const getCallBackgroundErrorMessage = (context: string) =>
  new InvalidOperationError(Operation.Create, DatabaseEntityType.CallBackground, context).message;
const seedSlots = (userId: string, slots: number[], slotSize: number) => {
  const bucket = getBucket(StorageBucket.UserAssets);
  return Promise.all(slots.map((slot) => bucket.put(getCallBackgroundBlobName(userId, slot), Buffer.alloc(slotSize))));
};

describe("userRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["user"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;
  const biography = "biography";
  const blobName = "a";
  const expiredAt = new Date(-1);
  const image = "image";
  const message = "message";
  const mimetype = MimeType.Png;
  const name = "name";
  const publishError = new Error(" ");
  const size = 1;
  const unexpiredAt = new Date(Temporal.Duration.from({ days: 7 }).total("milliseconds"));
  const updatedMessage = "updatedMessage";
  const userId = getMockSession().user.id;
  // A second session the caller holds, and a revoke that deletes its row the way better-auth would
  const holdOtherSession = async () => {
    const otherSession = createMockSession(userId);
    await mockContext.db
      .insert(sessionsInAuth)
      .values({
        expiresAt: otherSession.expiresAt,
        id: otherSession.id,
        ipAddress: "",
        token: otherSession.token,
        updatedAt: otherSession.updatedAt,
        userId,
      });
    getMockRevokeSession().mockImplementation(async ({ body: { token } }) => {
      await mockContext.db.delete(sessionsInAuth).where(eq(sessionsInAuth.token, token));
    });

    return otherSession;
  };
  // An accepted delete has ended the caller's sessions, marked the account and published the sweep once
  const expectAccountDeleted = async () => {
    const user = await mockContext.db.query.usersInAuth.findFirst({ where: { id: { eq: userId } } });
    const deleteAccountEvents = MockJobQueueDatabase.get(QueueJob.DeleteAccount);
    assert.exists(deleteAccountEvents);

    await expect(
      mockContext.db.query.sessionsInAuth.findMany({ where: { userId: { eq: userId } } }),
    ).resolves.toStrictEqual([]);
    expect(user?.deletionRequestedAt).toStrictEqual(new Date());
    expect(deleteAccountEvents).toHaveLength(1);
    expect(takeOne(deleteAccountEvents)).toStrictEqual({ userId });
  };
  // An export as the handler leaves it once its archive is committed, owned by the given person
  const insertReadyDataExport = async (ownerId: string, expiresAt: Date) =>
    takeOne(
      await mockContext.db
        .insert(dataExportsInUser)
        .values({
          blobName,
          expiresAt,
          readyAt: new Date(),
          requestedAt: new Date(),
          status: DataExportStatus.Ready,
          userId: ownerId,
        })
        .returning(),
    );

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.UserAssets));
    mockBuckets[StorageBucket.UserAssets] = bucket;
    mockContext = await createMockContext();
    caller = createCallerFactory(userRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    getMockRevokeSession().mockReset();
    await deleteDirectory(bucket);
    MockJobQueueDatabase.clear();
    await mockContext.db.delete(dataExportsInUser);
    await mockContext.db.delete(userStatusesInMessage);
    userObjectCalls.length = 0;
  });

  afterAll(async () => {
    await dispose();
  });

  // The plugin takes a key's permissions only from the server, so this is the one place they are set: to the scopes the
  // Owner ticked, on a key that belongs to the caller
  test("creates a key holding the scopes ticked, for the caller", async () => {
    expect.hasAssertions();

    const key = "key";
    const mcpScopes = [McpScope.FollowUps];
    getMockCreateApiKey().mockResolvedValueOnce({ key });

    const createdKey = await caller.createApiKey({ mcpScopes, name });

    expect(createdKey).toBe(key);
    expect(getMockCreateApiKey()).toHaveBeenCalledExactlyOnceWith({
      body: { name, permissions: { mcp: mcpScopes }, userId },
    });
  });

  // The revoke is stubbed, so the stub deletes the row the way better-auth would
  // The assertions read the rows and the one event the sweep is started by, not the calls that made them
  test("deleteAccount ends every session the caller holds, marks the account, and publishes the sweep once", async () => {
    expect.hasAssertions();

    await holdOtherSession();

    await caller.deleteAccount();

    await expectAccountDeleted();
  });

  // The marker is set before the sweep is published, so a publish that fails must fail the request and leave the caller
  // The sessions are ended only once the event is accepted, so the person can ask again
  test("deleteAccount fails when the sweep is not published, and the caller's sessions stay open", async () => {
    expect.hasAssertions();

    const otherSession = await holdOtherSession();
    vi.spyOn(MockJobQueue.prototype, "send").mockRejectedValueOnce(publishError);

    await expect(caller.deleteAccount()).rejects.toMatchObject({ cause: publishError });

    const sessions = await mockContext.db.query.sessionsInAuth.findMany({ where: { userId: { eq: userId } } });
    expect(MockJobQueueDatabase.size).toBe(0);
    expect(sessions.map(({ id }) => id)).toContain(otherSession.id);
  });

  test("deleteAccount succeeds on retry after a failed publish, and publishes the sweep once", async () => {
    expect.hasAssertions();

    await holdOtherSession();
    vi.spyOn(MockJobQueue.prototype, "send").mockRejectedValueOnce(publishError);

    await expect(caller.deleteAccount()).rejects.toMatchObject({ cause: publishError });
    await caller.deleteAccount();

    await expectAccountDeleted();
  });

  test("reads empty statuses with default values", async () => {
    expect.hasAssertions();

    const nonExistentUserId = v7();
    const userStatus = takeOne(await caller.readStatuses([nonExistentUserId]));

    expect(userStatus.expiresAt).toBeNull();
    expect(userStatus.message).toBe("");
    expect(userStatus.status).toBe(UserStatus.Online);
    expect(userStatus.userId).toBe(nonExistentUserId);
  });

  test("upsert status inserts", async () => {
    expect.hasAssertions();

    const status = UserStatus.DoNotDisturb;
    const upsertedUserStatus = await caller.upsertStatus({ message, status });
    vi.advanceTimersByTime(1);
    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(upsertedUserStatus.status).toBe(status);
    expect(upsertedUserStatus.userId).toBe(userId);
    expect(userStatus.message).toBe(message);
    expect(userStatus.status).toBe(status);
  });

  test("upsert status updates", async () => {
    expect.hasAssertions();

    await caller.upsertStatus({ message, status: UserStatus.DoNotDisturb });
    vi.advanceTimersByTime(1);
    const upsertedUserStatus = await caller.upsertStatus({ message: updatedMessage, status: UserStatus.Idle });
    vi.advanceTimersByTime(1);
    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(upsertedUserStatus.status).toBe(UserStatus.Idle);
    expect(upsertedUserStatus.userId).toBe(userId);
    expect(userStatus.message).toBe(updatedMessage);
    expect(userStatus.status).toBe(UserStatus.Idle);
  });

  test("upserts status sends it to the caller's object", async () => {
    expect.hasAssertions();

    const upsertedUserStatus = await caller.upsertStatus({ status: UserStatus.Online });

    expect(userObjectCalls).toStrictEqual([{ args: [upsertedUserStatus], method: "upsertStatus", userId }]);
  });

  test("generates profile image upload url", async () => {
    expect.hasAssertions();

    const { publicUrl, sasUrl } = await caller.generateProfileImageUploadUrl();
    const presignedUrl = new URL(sasUrl);

    expect(publicUrl).toBe(`${TEST_ORIGIN}/${StorageBucket.PublicUserAssets}/${userId}/ProfileImage`);
    expect(presignedUrl.pathname).toContain(`/${userId}/ProfileImage`);
    expect(presignedUrl.searchParams.get("X-Amz-Expires")).toBe(String(WRITE_SAS_DURATION_MS / 1000));
  });

  test("updates", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const updatedUser = await caller.updateUser({ biography, image, name: ` ${name} ` });

    expect(updatedUser.biography).toBe(biography);
    expect(updatedUser.image).toBe(image);
    expect(updatedUser.name).toBe(name);
  });

  test("clears biography", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await caller.updateUser({ biography });
    await mockSessionOnce(mockContext.db, user);
    const updatedUser = await caller.updateUser({ biography: "" });

    expect(updatedUser.biography).toBe("");
  });

  test("reads user", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await caller.updateUser({ biography, image, name });
    const publicUser = await caller.readUser(user.id);

    // Only the allowlisted columns are projected — private fields (email) never leave the database
    expect(publicUser).toStrictEqual({ biography, image, name });
  });

  test("reads user unauthenticated", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await caller.updateUser({ biography, image, name });
    mockNoSessionOnce();
    const publicUser = await caller.readUser(user.id);

    expect(publicUser).toStrictEqual({ biography, image, name });
  });

  test("fails read user with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.readUser("-1")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.User, "-1").message}]`,
    );
  });

  test("readCallBackgrounds lists the slots under the caller's own prefix", async () => {
    expect.hasAssertions();

    await seedSlots(userId, [0, 2], size);

    await expect(caller.readCallBackgrounds()).resolves.toStrictEqual([
      { sasUrl: expect.stringContaining(`/${getCallBackgroundBlobName(userId, 0)}?`), slot: 0 },
      { sasUrl: expect.stringContaining(`/${getCallBackgroundBlobName(userId, 2)}?`), slot: 2 },
    ]);
  });

  // `NaN` survives a string round trip through `Number` and fails no range comparison, so it is the one name
  // The integer check alone keeps out
  test.each(["a", String(Number.NaN)])("readCallBackgrounds passes over %s under the prefix", async (slotName) => {
    expect.hasAssertions();

    await bucket.put(`${getCallBackgroundPrefix(userId)}${slotName}`, Buffer.alloc(size));
    const callBackgrounds = await caller.readCallBackgrounds();

    // Never listed, and never reclaimed on a guess either — nothing is published for a name this router did
    // Not mint
    expect(callBackgrounds).toStrictEqual([]);
    expect(MockJobQueueDatabase.size).toBe(0);
  });

  test("readCallBackgrounds drops a slot over the size cap and reclaims it", async () => {
    expect.hasAssertions();

    await seedSlots(userId, [0], MAX_CALL_BACKGROUND_SIZE_BYTES + 1);
    const callBackgrounds = await caller.readCallBackgrounds();
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion);
    assert.exists(blobDeletionEvents);

    expect(callBackgrounds).toStrictEqual([]);
    expect(takeOne(blobDeletionEvents) as BlobDeletionQueueMessage).toStrictEqual({
      blobNames: [getCallBackgroundBlobName(userId, 0)],
      containerName: StorageBucket.UserAssets,
    });
  });

  // A slot the caller already holds is a replacement, not a collision — and one freed a moment ago is still
  // In the listing until a worker reclaims it, which is exactly why nothing here reads that listing
  test("generateCallBackgroundUploadUrl mints a write target for the slot it is given, occupied or not", async () => {
    expect.hasAssertions();

    await seedSlots(
      userId,
      Array.from({ length: MAX_CALL_BACKGROUNDS }, (_value, slot) => slot),
      size,
    );

    await expect(caller.generateCallBackgroundUploadUrl({ mimetype, size, slot: 0 })).resolves.toStrictEqual(
      expect.stringContaining(`/${getCallBackgroundBlobName(userId, 0)}?`),
    );
  });

  test("fails generateCallBackgroundUploadUrl with a file over the size cap", async () => {
    expect.hasAssertions();

    const input = { mimetype, size: MAX_CALL_BACKGROUND_SIZE_BYTES + 1, slot: 0 };

    await expect(caller.generateCallBackgroundUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getCallBackgroundErrorMessage(JSON.stringify({ mimetype: input.mimetype, size: input.size }))}]`,
    );
  });

  test("fails generateCallBackgroundUploadUrl with a file that is not an image", async () => {
    expect.hasAssertions();

    const input = { mimetype: MimeType.Pdf, size, slot: 0 };

    await expect(caller.generateCallBackgroundUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getCallBackgroundErrorMessage(JSON.stringify({ mimetype: input.mimetype, size: input.size }))}]`,
    );
  });

  test("deleteCallBackground publishes a bounded prefix deletion so a re-upload survives a replay", async () => {
    expect.hasAssertions();

    await seedSlots(userId, [0], size);
    await caller.deleteCallBackground({ slot: 0 });
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion);
    assert.exists(blobDeletionEvents);

    // The bound is what stops a redelivered delete taking the image that replaced the one it named
    expect(takeOne(blobDeletionEvents) as BlobDeletionQueueMessage).toStrictEqual({
      containerName: StorageBucket.UserAssets,
      createdBefore: new Date(0),
      prefix: getCallBackgroundBlobName(userId, 0),
    });
  });

  test("requestDataExport queues an export and publishes it once", async () => {
    expect.hasAssertions();

    const dataExport = await caller.requestDataExport();
    const dataExportEvents = MockJobQueueDatabase.get(QueueJob.ExportUserData);
    assert.exists(dataExportEvents);

    expect(dataExport.status).toBe(DataExportStatus.Queued);
    expect(dataExport.userId).toBe(userId);
    expect(dataExportEvents).toHaveLength(1);
    expect(takeOne(dataExportEvents)).toStrictEqual({ dataExportId: dataExport.id });
  });

  test("requestDataExport returns the active export to a second request, and publishes nothing more", async () => {
    expect.hasAssertions();

    const firstDataExport = await caller.requestDataExport();
    const secondDataExport = await caller.requestDataExport();

    expect(secondDataExport).toStrictEqual(firstDataExport);
    expect(MockJobQueueDatabase.get(QueueJob.ExportUserData)).toHaveLength(1);
  });

  // The row is deleted when its event is refused, so a retry queues a new export rather than returning one that
  // Nothing builds
  test("requestDataExport fails when the event is not published, and a retry queues the export again", async () => {
    expect.hasAssertions();

    vi.spyOn(MockJobQueue.prototype, "send").mockRejectedValueOnce(publishError);

    await expect(caller.requestDataExport()).rejects.toMatchObject({ cause: publishError });
    await expect(
      mockContext.db.query.dataExportsInUser.findMany({ where: { userId: { eq: userId } } }),
    ).resolves.toStrictEqual([]);

    const dataExport = await caller.requestDataExport();

    expect(dataExport.status).toBe(DataExportStatus.Queued);
    expect(MockJobQueueDatabase.get(QueueJob.ExportUserData)).toHaveLength(1);
  });

  test("readDataExport returns the export being built", async () => {
    expect.hasAssertions();

    const dataExport = await caller.requestDataExport();

    await expect(caller.readDataExport()).resolves.toStrictEqual(dataExport);
  });

  test("readDataExport returns the ready export when none is being built", async () => {
    expect.hasAssertions();

    const readyDataExport = await insertReadyDataExport(userId, unexpiredAt);

    await expect(caller.readDataExport()).resolves.toStrictEqual(readyDataExport);
  });

  // The failed export is requested after the ready one, so it is the latest, and the settings page must show it
  test("readDataExport returns the latest export when none is being built, a failed one included", async () => {
    expect.hasAssertions();

    await insertReadyDataExport(userId, unexpiredAt);
    const failedDataExport = takeOne(
      await mockContext.db
        .insert(dataExportsInUser)
        .values({ failureReason: "a", requestedAt: new Date(1), status: DataExportStatus.Failed, userId })
        .returning(),
    );

    await expect(caller.readDataExport()).resolves.toStrictEqual(failedDataExport);
  });

  test("generateDataExportLink mints a read link to the owner's ready export", async () => {
    expect.hasAssertions();

    const dataExport = await insertReadyDataExport(userId, unexpiredAt);
    const link = await caller.generateDataExportLink(dataExport.id);
    const presignedLink = new URL(link);

    expect(presignedLink.pathname).toContain(`/${blobName}`);
    expect(presignedLink.searchParams.get("X-Amz-Expires")).toBe(String(DATA_EXPORT_LINK_DURATION_MS / 1000));
  });

  const insertDataExportWithStatus = async (status: DataExportStatus) =>
    takeOne(await mockContext.db.insert(dataExportsInUser).values({ status, userId }).returning()).id;

  // Each status gets its own test: an inline snapshot belongs to its call site, and the id in the message differs per row
  test("generateDataExportLink refuses a building export", async () => {
    expect.hasAssertions();

    const dataExportId = await insertDataExportWithStatus(DataExportStatus.Building);

    await expect(caller.generateDataExportLink(dataExportId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, dataExportId).message}]`,
    );
  });

  test("generateDataExportLink refuses a failed export", async () => {
    expect.hasAssertions();

    const dataExportId = await insertDataExportWithStatus(DataExportStatus.Failed);

    await expect(caller.generateDataExportLink(dataExportId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, dataExportId).message}]`,
    );
  });

  test("generateDataExportLink refuses a queued export", async () => {
    expect.hasAssertions();

    const dataExportId = await insertDataExportWithStatus(DataExportStatus.Queued);

    await expect(caller.generateDataExportLink(dataExportId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, dataExportId).message}]`,
    );
  });

  test("generateDataExportLink refuses another person's export", async () => {
    expect.hasAssertions();

    const otherUser = await createMockUser(mockContext.db);
    const dataExport = await insertReadyDataExport(otherUser.id, unexpiredAt);

    await expect(caller.generateDataExportLink(dataExport.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.DataExport, dataExport.id).message}]`,
    );
  });

  test("generateDataExportLink refuses an expired export", async () => {
    expect.hasAssertions();

    const dataExport = await insertReadyDataExport(userId, expiredAt);

    await expect(caller.generateDataExportLink(dataExport.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, dataExport.id).message}]`,
    );
  });
});
