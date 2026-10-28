import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockSession } from "#server/auth.test";
import { getCallBackgroundBlobName } from "#server/services/message/call/getCallBackgroundBlobName";
import { getCallBackgroundPrefix } from "#server/services/message/call/getCallBackgroundPrefix";
import { DATA_EXPORT_LINK_DURATION_MS } from "#server/services/user/constants";
import { createCallerFactory } from "#server/trpc";
import {
  consumeMockSessionOnce,
  createMockContext,
  createMockUser,
  getMockCreateApiKey,
  getMockRevokeSession,
  getMockSession,
  mockNoSessionOnce,
  mockSessionOnce,
} from "#server/trpc/context.test";
import { getFirstEmit } from "#server/trpc/routers/getFirstEmit.test";
import { userRouter } from "#server/trpc/routers/user";
import { withAsyncIterator } from "#server/trpc/routers/withAsyncIterator.test";
import { McpScope } from "#shared/models/auth/McpScope";
import { MimeType } from "#shared/models/file/MimeType";
import { MAX_CALL_BACKGROUND_SIZE_BYTES, MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import {
  AzureContainer,
  AzureFunction,
  DatabaseEntityType,
  dataExportsInUser,
  DataExportStatus,
  READ_SAS_DURATION_MS,
  sessionsInAuth,
  UserStatus,
  userStatusesInMessage,
  WRITE_SAS_DURATION_MS,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import {
  getMockSasUrl,
  MOCK_BLOB_BASE_URL,
  MockContainerDatabase,
  MockEventGridDatabase,
  MockEventGridPublisherClient,
  MockTableDatabase,
} from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const getCallBackgroundErrorMessage = (context: string) =>
  new InvalidOperationError(Operation.Create, DatabaseEntityType.CallBackground, context).message;
const seedSlots = (userId: string, slots: number[], slotSize: number) => {
  MockContainerDatabase.set(
    AzureContainer.UserAssets,
    new Map(slots.map((slot) => [getCallBackgroundBlobName(userId, slot), Buffer.alloc(slotSize)])),
  );
};

describe("userRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["user"]>;
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
  const getCallBackgroundUrl = (slot: number) =>
    `${MOCK_BLOB_BASE_URL}/${AzureContainer.UserAssets}/${getCallBackgroundBlobName(userId, slot)}`;
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
    mockContext = await createMockContext();
    caller = createCallerFactory(userRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(async () => {
    vi.useRealTimers();
    getMockRevokeSession().mockReset();
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(dataExportsInUser);
    await mockContext.db.delete(userStatusesInMessage);
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

    const user = await mockContext.db.query.usersInAuth.findFirst({ where: { id: { eq: userId } } });
    const deleteAccountEvents = MockEventGridDatabase.get("");
    assert.exists(deleteAccountEvents);

    await expect(
      mockContext.db.query.sessionsInAuth.findMany({ where: { userId: { eq: userId } } }),
    ).resolves.toStrictEqual([]);
    expect(user?.deletionRequestedAt).toStrictEqual(new Date());
    expect(deleteAccountEvents).toHaveLength(1);
    expect(takeOne(deleteAccountEvents).data).toStrictEqual({ userId });
    expect(takeOne(deleteAccountEvents).eventType).toBe(AzureFunction.DeleteAccount);
    expect(takeOne(deleteAccountEvents).subject).toBe(userId);
  });

  // The marker is set before the sweep is published, so a publish that fails must fail the request and leave the caller
  // The sessions are ended only once the event is accepted, so the person can ask again
  test("deleteAccount fails when the sweep is not published, and the caller's sessions stay open", async () => {
    expect.hasAssertions();

    const otherSession = await holdOtherSession();
    vi.spyOn(MockEventGridPublisherClient.prototype, "send").mockRejectedValueOnce(publishError);

    await expect(caller.deleteAccount()).rejects.toMatchObject({ cause: publishError });

    const sessions = await mockContext.db.query.sessionsInAuth.findMany({ where: { userId: { eq: userId } } });
    expect(MockEventGridDatabase.get("")).toBeUndefined();
    expect(sessions.map(({ id }) => id)).toContain(otherSession.id);
  });

  test("deleteAccount succeeds on retry after a failed publish, and publishes the sweep once", async () => {
    expect.hasAssertions();

    await holdOtherSession();
    vi.spyOn(MockEventGridPublisherClient.prototype, "send").mockRejectedValueOnce(publishError);

    await expect(caller.deleteAccount()).rejects.toMatchObject({ cause: publishError });
    await caller.deleteAccount();

    const user = await mockContext.db.query.usersInAuth.findFirst({ where: { id: { eq: userId } } });
    const deleteAccountEvents = MockEventGridDatabase.get("");
    assert.exists(deleteAccountEvents);

    await expect(
      mockContext.db.query.sessionsInAuth.findMany({ where: { userId: { eq: userId } } }),
    ).resolves.toStrictEqual([]);
    expect(user?.deletionRequestedAt).toStrictEqual(new Date());
    expect(deleteAccountEvents).toHaveLength(1);
    expect(takeOne(deleteAccountEvents).data).toStrictEqual({ userId });
    expect(takeOne(deleteAccountEvents).eventType).toBe(AzureFunction.DeleteAccount);
    expect(takeOne(deleteAccountEvents).subject).toBe(userId);
  });

  test("reads empty statuses with default values", async () => {
    expect.hasAssertions();

    const nonExistentUserId = crypto.randomUUID();
    const userStatus = takeOne(await caller.readStatuses([nonExistentUserId]));

    expect(userStatus.expiresAt).toBeNull();
    expect(userStatus.message).toBe("");
    expect(userStatus.status).toBe(UserStatus.Online);
    expect(userStatus.userId).toBe(nonExistentUserId);
  });

  test.each(["connect", "disconnect"] as const)("%s inserts", async (procedure) => {
    expect.hasAssertions();

    const oldUserStatus = takeOne(await caller.readStatuses([userId]));
    vi.advanceTimersByTime(1);
    await caller[procedure]();
    vi.advanceTimersByTime(1);
    const newUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 1);
  });

  test.each(["connect", "disconnect"] as const)("%s updates", async (procedure) => {
    expect.hasAssertions();

    await caller[procedure]();
    vi.advanceTimersByTime(1);
    const oldUserStatus = takeOne(await caller.readStatuses([userId]));
    vi.advanceTimersByTime(1);
    await caller[procedure]();
    vi.advanceTimersByTime(1);
    const newUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 2);
  });

  test("connect disconnect connect", async () => {
    expect.hasAssertions();

    await caller.connect();
    vi.advanceTimersByTime(1);
    await caller.disconnect();
    vi.advanceTimersByTime(1);
    const oldUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(oldUserStatus.status).toBe(UserStatus.Offline);

    vi.advanceTimersByTime(1);
    await caller.connect();
    vi.advanceTimersByTime(1);
    const newUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(newUserStatus.status).toBe(UserStatus.Online);
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

  test("on upserts status", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    // The queued session is spent without a request, so the subscription below is opened by the original user
    // While listening for the freshly created one
    await consumeMockSessionOnce();
    const subscription = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const status = UserStatus.Online;
    const data = await getFirstEmit(
      () => subscription,
      () => caller.upsertStatus({ status }),
    );

    expect(data.status).toBe(status);
    expect(data.userId).toBe(user.id);
  });

  test(`on upserts status ${UserStatus.Online} with connect`, async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await consumeMockSessionOnce();
    const subscription = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const data = await getFirstEmit(
      () => subscription,
      () => caller.connect(),
    );

    expect(data.status).toBe(UserStatus.Online);
    expect(data.userId).toBe(user.id);
  });

  test(`on upserts status ${UserStatus.Offline} with disconnect`, async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await consumeMockSessionOnce();
    const subscription = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const data = await getFirstEmit(
      () => subscription,
      () => caller.disconnect(),
    );

    expect(data.status).toBe(UserStatus.Offline);
    expect(data.userId).toBe(user.id);
  });

  test("fails on upserts status with self", async () => {
    expect.hasAssertions();

    const subscription = await caller.onUpsertStatus([userId]);

    await expect(
      withAsyncIterator(
        () => subscription,
        (iterator) => iterator.next(),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserStatus, JSON.stringify([userId])).message}]`,
    );
  });

  test("generates profile image upload url", async () => {
    expect.hasAssertions();

    const { publicUrl, sasUrl } = await caller.generateProfileImageUploadUrl();

    expect(publicUrl).toBe(`${MOCK_BLOB_BASE_URL}/${AzureContainer.PublicUserAssets}/${userId}/ProfileImage`);
    expect(sasUrl).toBe(getMockSasUrl(publicUrl, "w", "b", new Date(WRITE_SAS_DURATION_MS)));
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

    seedSlots(userId, [0, 2], size);

    await expect(caller.readCallBackgrounds()).resolves.toStrictEqual([
      { sasUrl: getMockSasUrl(getCallBackgroundUrl(0), "r", "b", new Date(READ_SAS_DURATION_MS)), slot: 0 },
      { sasUrl: getMockSasUrl(getCallBackgroundUrl(2), "r", "b", new Date(READ_SAS_DURATION_MS)), slot: 2 },
    ]);
  });

  // `NaN` survives a string round trip through `Number` and fails no range comparison, so it is the one name
  // The integer check alone keeps out
  test.each(["a", String(Number.NaN)])("readCallBackgrounds passes over %s under the prefix", async (slotName) => {
    expect.hasAssertions();

    MockContainerDatabase.set(
      AzureContainer.UserAssets,
      new Map([[`${getCallBackgroundPrefix(userId)}${slotName}`, Buffer.alloc(size)]]),
    );
    const callBackgrounds = await caller.readCallBackgrounds();

    // Never listed, and never reclaimed on a guess either — nothing is published for a name this router did
    // Not mint
    expect(callBackgrounds).toStrictEqual([]);
    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  test("readCallBackgrounds drops a slot over the size cap and reclaims it", async () => {
    expect.hasAssertions();

    seedSlots(userId, [0], MAX_CALL_BACKGROUND_SIZE_BYTES + 1);
    const callBackgrounds = await caller.readCallBackgrounds();
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    expect(callBackgrounds).toStrictEqual([]);
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [getCallBackgroundBlobName(userId, 0)],
      containerName: AzureContainer.UserAssets,
    });
  });

  // A slot the caller already holds is a replacement, not a collision — and one freed a moment ago is still
  // In the listing until a worker reclaims it, which is exactly why nothing here reads that listing
  test("generateCallBackgroundUploadUrl mints a write target for the slot it is given, occupied or not", async () => {
    expect.hasAssertions();

    seedSlots(
      userId,
      Array.from({ length: MAX_CALL_BACKGROUNDS }, (_value, slot) => slot),
      size,
    );

    await expect(caller.generateCallBackgroundUploadUrl({ mimetype, size, slot: 0 })).resolves.toBe(
      getMockSasUrl(getCallBackgroundUrl(0), "w", "b", new Date(WRITE_SAS_DURATION_MS)),
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

    seedSlots(userId, [0], size);
    await caller.deleteCallBackground({ slot: 0 });
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    // The bound is what stops a redelivered delete taking the image that replaced the one it named
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      containerName: AzureContainer.UserAssets,
      createdBefore: new Date(0),
      prefix: getCallBackgroundBlobName(userId, 0),
    });
  });

  test("requestDataExport queues an export and publishes it once", async () => {
    expect.hasAssertions();

    const dataExport = await caller.requestDataExport();
    const dataExportEvents = MockEventGridDatabase.get("");
    assert.exists(dataExportEvents);

    expect(dataExport.status).toBe(DataExportStatus.Queued);
    expect(dataExport.userId).toBe(userId);
    expect(dataExportEvents).toHaveLength(1);
    expect(takeOne(dataExportEvents).data).toStrictEqual({ dataExportId: dataExport.id });
    expect(takeOne(dataExportEvents).eventType).toBe(AzureFunction.ExportUserData);
    expect(takeOne(dataExportEvents).subject).toBe(userId);
  });

  test("requestDataExport returns the active export to a second request, and publishes nothing more", async () => {
    expect.hasAssertions();

    const firstDataExport = await caller.requestDataExport();
    const secondDataExport = await caller.requestDataExport();

    expect(secondDataExport).toStrictEqual(firstDataExport);
    expect(MockEventGridDatabase.get("")).toHaveLength(1);
  });

  // The row is deleted when its event is refused, so a retry queues a new export rather than returning one that
  // Nothing builds
  test("requestDataExport fails when the event is not published, and a retry queues the export again", async () => {
    expect.hasAssertions();

    vi.spyOn(MockEventGridPublisherClient.prototype, "send").mockRejectedValueOnce(publishError);

    await expect(caller.requestDataExport()).rejects.toMatchObject({ cause: publishError });
    await expect(
      mockContext.db.query.dataExportsInUser.findMany({ where: { userId: { eq: userId } } }),
    ).resolves.toStrictEqual([]);

    const dataExport = await caller.requestDataExport();

    expect(dataExport.status).toBe(DataExportStatus.Queued);
    expect(MockEventGridDatabase.get("")).toHaveLength(1);
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

    expect(link).toBe(
      getMockSasUrl(
        `${MOCK_BLOB_BASE_URL}/${AzureContainer.UserAssets}/${blobName}`,
        "r",
        "b",
        new Date(DATA_EXPORT_LINK_DURATION_MS),
      ),
    );
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
