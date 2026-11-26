import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { BlobDeletionQueueMessage } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { getCallBackgroundBlobName } from "#server/services/message/call/getCallBackgroundBlobName";
import { MockJobQueue } from "#server/services/queue/getJobQueue.test";
import { getMockPublishedTopics, MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { getBucket } from "#server/services/storage/getBucket";
import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { DATA_EXPORT_LINK_DURATION_MS } from "#server/services/user/constants";
import {
  createMockAuthSession,
  createMockContext,
  createMockUser,
  getMockCreateApiKey,
  getMockRevokeSession,
  getMockSession,
} from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { blockRouter } from "#server/trpc/routers/block";
import { createFriends } from "#server/trpc/routers/createFriends.test";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { friendRequestRouter } from "#server/trpc/routers/friendRequest";
import { roomRouter } from "#server/trpc/routers/room/index";
import { userRouter } from "#server/trpc/routers/user";
import { MimeType } from "#shared/models/file/MimeType";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { MAX_CALL_BACKGROUND_SIZE_BYTES, MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { userSettingsTable } from "#src/services/message/user/settings/constants";
import { getUpdateUserSettingsEntry } from "#src/services/message/user/settings/getUpdateUserSettingsEntry";
import { deleteDirectory } from "@esposter/db";
import { MockJobQueueDatabase } from "@esposter/db-mock";
import {
  DatabaseEntityType,
  dataExportsInUser,
  DataExportStatus,
  getBlobTopic,
  getCallBackgroundPrefix,
  getStorageBucketBindingName,
  getUserProfileImageBlobName,
  McpScope,
  QueueJob,
  sessionsInAuth,
  StorageBucket,
  UserStatus,
  userStatusesInMessage,
  WRITE_PRESIGNED_URL_DURATION_MS,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const getCallBackgroundErrorMessage = (context: string) =>
  new InvalidOperationError(Operation.Create, DatabaseEntityType.CallBackground, context).message;
const getFileErrorMessage = (context: string) =>
  new InvalidOperationError(Operation.Create, DatabaseEntityType.File, context).message;
const seedSlots = (userId: string, slots: number[], slotSize: number) => {
  const bucket = getBucket(StorageBucket.UserAssets);
  return Promise.all(slots.map((slot) => bucket.put(getCallBackgroundBlobName(userId, slot), Buffer.alloc(slotSize))));
};

describe("userRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["user"]>;
  const { getMockBucket } = setupMockStorageBucket(StorageBucket.UserAssets);
  const { getMockBucket: getPublicUserAssets } = setupMockStorageBucket(StorageBucket.PublicUserAssets);
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
  const refusedDataExportId = v7();
  const userId = getMockSession().user.id;
  // A second session the caller holds, and a revoke that deletes its row the way better-auth would
  const holdOtherSession = async () => {
    const { session: otherSession } = await createMockAuthSession(mockContext.db, getMockSession().user);
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
    mockContext = await createMockContext();
    caller = createCallerFactory(userRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    getMockRevokeSession().mockReset();
    await deleteDirectory(getMockBucket());
    await deleteDirectory(getPublicUserAssets());
    MockJobQueueDatabase.clear();
    await mockContext.db.delete(dataExportsInUser);
    await mockContext.db.delete(userStatusesInMessage);
    userObjectCalls.length = 0;
  });

  // The plugin takes a key's permissions only from the server, so this is the one place they are set: to the scopes the
  // Owner ticked, on a key that belongs to the caller
  test("creates a key holding the scopes ticked, for the caller", async () => {
    expect.hasAssertions();

    const key = "key";
    const mcpScopes: McpScope[] = [McpScope.FollowUps];
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
  test("deleteAccount fails with an unpublished sweep, and the caller's sessions stay open", async () => {
    expect.hasAssertions();

    const otherSession = await holdOtherSession();
    vi.spyOn(MockJobQueue.prototype, "send").mockRejectedValueOnce(publishError);

    await expect(caller.deleteAccount()).rejects.toMatchObject({ cause: publishError });

    const sessions = await mockContext.db.query.sessionsInAuth.findMany({ where: { userId: { eq: userId } } });

    expect(MockJobQueueDatabase.size).toBe(0);
    expect(sessions.map(({ id }) => id)).toStrictEqual([otherSession.id]);
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

    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(userStatus.expiresAt).toBeNull();
    expect(userStatus.message).toBe("");
    expect(userStatus.status).toBe(UserStatus.Online);
    expect(userStatus.userId).toBe(userId);
  });

  // A status is read by its owner, the owner's friends and the users who share a room with the owner, and no one else
  test("does not read the status of a stranger", async () => {
    expect.hasAssertions();

    const stranger = await createMockAuthSession(mockContext.db);
    await createCallerFactory(userRouter)(await createMockContext(stranger)).upsertStatus({
      message,
      status: UserStatus.DoNotDisturb,
    });

    await expect(caller.readStatuses([stranger.user.id])).resolves.toStrictEqual([]);
  });

  test("reads the status of a user who shares a room with the caller", async () => {
    expect.hasAssertions();

    const room = await createCallerFactory(roomRouter)(mockContext).createRoom({ name });
    const roommate = await createMockAuthSession(mockContext.db);
    await createRoomMember(mockContext, room.id, roommate.user);
    await createCallerFactory(userRouter)(await createMockContext(roommate)).upsertStatus({
      message,
      status: UserStatus.DoNotDisturb,
    });

    const userStatus = takeOne(await caller.readStatuses([roommate.user.id]));

    expect(userStatus.message).toBe(message);
    expect(userStatus.status).toBe(UserStatus.DoNotDisturb);
  });

  test("reads the status of a friend", async () => {
    expect.hasAssertions();

    const friend = await createMockAuthSession(mockContext.db);
    await createFriends(mockContext, friend.user);
    await createCallerFactory(userRouter)(await createMockContext(friend)).upsertStatus({
      message,
      status: UserStatus.DoNotDisturb,
    });

    const userStatus = takeOne(await caller.readStatuses([friend.user.id]));

    expect(userStatus.message).toBe(message);
    expect(userStatus.status).toBe(UserStatus.DoNotDisturb);
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

  test("generates profile image upload url signed to the image's content type", async () => {
    expect.hasAssertions();

    const { presignedUrl, publicUrl } = await caller.generateProfileImageUploadUrl({ mimetype, size });
    const parsedPresignedUrl = new URL(presignedUrl);

    expect(publicUrl).toBe(`${TEST_ORIGIN}/${StorageBucket.PublicUserAssets}/${userId}/ProfileImage`);
    expect(parsedPresignedUrl.pathname).toContain(`/${userId}/ProfileImage`);
    expect(parsedPresignedUrl.searchParams.get("X-Amz-Expires")).toBe(String(WRITE_PRESIGNED_URL_DURATION_MS / 1000));
    expect(parsedPresignedUrl.searchParams.get("X-Amz-SignedHeaders")).toBe("content-type;host");
  });

  test("fails generateProfileImageUploadUrl with a file over the size cap", async () => {
    expect.hasAssertions();

    const input = { mimetype, size: MAX_FILE_REQUEST_SIZE + 1 };

    await expect(caller.generateProfileImageUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getFileErrorMessage(JSON.stringify(input))}]`,
    );
  });

  test("fails generateProfileImageUploadUrl with a file that is not an image", async () => {
    expect.hasAssertions();

    const input = { mimetype: MimeType.Pdf, size };

    await expect(caller.generateProfileImageUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getFileErrorMessage(JSON.stringify(input))}]`,
    );
  });

  // An svg is an image type that can carry script, and it is served from the public assets host, so a profile never
  // Takes one
  test("fails generateProfileImageUploadUrl with an svg image", async () => {
    expect.hasAssertions();

    const input = { mimetype: MimeType.Svg, size };

    await expect(caller.generateProfileImageUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getFileErrorMessage(JSON.stringify(input))}]`,
    );
  });

  // The client's PUT lands the bytes the presigned url could not bound, so a save naming the profile image checks them
  test("fails updateUser with a profile image over the size cap, and deletes it", async () => {
    expect.hasAssertions();

    const profileImageBlobName = getUserProfileImageBlobName(userId);
    await getPublicUserAssets().put(profileImageBlobName, Buffer.alloc(MAX_FILE_REQUEST_SIZE + 1));

    await expect(
      caller.updateUser({ image: `${TEST_ORIGIN}/${StorageBucket.PublicUserAssets}/${profileImageBlobName}` }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.User, userId).message}]`,
    );
    await expect(getPublicUserAssets().head(profileImageBlobName)).resolves.toBeNull();
  });

  test("updates", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    const updatedUser = await createCallerFactory(userRouter)(await createMockContext(authSession)).updateUser({
      biography,
      image,
      name: ` ${name} `,
    });

    expect(updatedUser.biography).toBe(biography);
    expect(updatedUser.image).toBe(image);
    expect(updatedUser.name).toBe(name);
  });

  test("clears biography", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    const authSessionCaller = createCallerFactory(userRouter)(await createMockContext(authSession));
    await authSessionCaller.updateUser({ biography });
    const updatedUser = await authSessionCaller.updateUser({ biography: "" });

    expect(updatedUser.biography).toBe("");
  });

  // A member's list shows the saver's name, so the save wakes the room's read that a member made before it
  test("a save shows its new name to the members of each room the person is in", async () => {
    expect.hasAssertions();

    const savedName = "saved name";
    const room = await createCallerFactory(roomRouter)(mockContext).createRoom({ name });
    const roomCaller = createCallerFactory(roomRouter)(mockContext);
    await roomCaller.readMembers({ roomId: room.id });
    await caller.updateUser({ name: savedName });

    const members = await roomCaller.readMembers({ roomId: room.id });

    expect(members.items.map((member) => member.name)).toStrictEqual([savedName]);
  });

  // A pending request shows the saver's name on the receiver's list, so the save wakes the list the receiver read
  // Before it
  test("a save shows its new name on the pending requests its receiver lists", async () => {
    expect.hasAssertions();

    const savedName = "saved name";
    const receiverSession = await createMockAuthSession(mockContext.db);
    const receiverCaller = createCallerFactory(friendRequestRouter)(await createMockContext(receiverSession));
    await createCallerFactory(friendRequestRouter)(mockContext).sendFriendRequest(receiverSession.user.id);
    await receiverCaller.readFriendRequests();
    await caller.updateUser({ name: savedName });

    const requests = await receiverCaller.readFriendRequests();

    expect(requests.map(({ sender }) => sender.name)).toStrictEqual([savedName]);
  });

  // A blocker's list shows the blocked person's name, so the save wakes the list the blocker read before it
  test("a save shows its new name on the blocked list of each person who blocked the one saving", async () => {
    expect.hasAssertions();

    const savedName = "saved name";
    const blockerSession = await createMockAuthSession(mockContext.db);
    const blockerCaller = createCallerFactory(blockRouter)(await createMockContext(blockerSession));
    await blockerCaller.createBlock(getMockSession().user.id);
    await blockerCaller.readBlockedUsers();
    await caller.updateUser({ name: savedName });

    const blockedUsers = await blockerCaller.readBlockedUsers();

    expect(blockedUsers.map(({ blocked }) => blocked.name)).toStrictEqual([savedName]);
  });

  test("updates settings and reads them back", async () => {
    expect.hasAssertions();

    await caller.upsertUserSettings({ isMuteOnJoin: true });
    const userSettings = await caller.readUserSettings();

    expect(userSettings.isMuteOnJoin).toBe(true);
  });

  test("reads user", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    await createCallerFactory(userRouter)(await createMockContext(authSession)).updateUser({ biography, image, name });
    const publicUser = await caller.readUser(authSession.user.id);

    // Only the allowlisted columns are projected — private fields (email) never leave the database
    expect(publicUser).toStrictEqual({ biography, image, name });
  });

  test("reads user unauthenticated", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    await createCallerFactory(userRouter)(await createMockContext(authSession)).updateUser({ biography, image, name });
    const signedOutCaller = createCallerFactory(userRouter)(await createMockContext(null));
    const publicUser = await signedOutCaller.readUser(authSession.user.id);

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
      { presignedUrl: expect.stringContaining(`/${getCallBackgroundBlobName(userId, 0)}?`), slot: 0 },
      { presignedUrl: expect.stringContaining(`/${getCallBackgroundBlobName(userId, 2)}?`), slot: 2 },
    ]);
  });

  // `NaN` survives a string round trip through `Number` and fails no range comparison, so it is the one name
  // The integer check alone keeps out
  test.each(["a", String(Number.NaN)])("readCallBackgrounds passes over %s under the prefix", async (slotName) => {
    expect.hasAssertions();

    await getMockBucket().put(`${getCallBackgroundPrefix(userId)}${slotName}`, Buffer.alloc(size));
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
      storageBucket: StorageBucket.UserAssets,
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

  test("fails generateCallBackgroundUploadUrl with an svg image", async () => {
    expect.hasAssertions();

    const input = { mimetype: MimeType.Svg, size, slot: 0 };

    await expect(caller.generateCallBackgroundUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getCallBackgroundErrorMessage(JSON.stringify({ mimetype: input.mimetype, size: input.size }))}]`,
    );
  });

  // The upload went to R2 straight from the client, so the confirm is the one write the listing's readers hear of: it
  // Wakes the prefix readCallBackgrounds lists under
  test("confirmCallBackgroundUpload wakes the caller's call background listing", async () => {
    expect.hasAssertions();

    MockPublishedTopics.length = 0;
    await caller.confirmCallBackgroundUpload({ slot: 0 });

    expect(getMockPublishedTopics()).toContain(
      getBlobTopic(getStorageBucketBindingName(StorageBucket.UserAssets), getCallBackgroundPrefix(userId)),
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
      createdBefore: new Date(0),
      prefix: getCallBackgroundBlobName(userId, 0),
      storageBucket: StorageBucket.UserAssets,
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
  test("requestDataExport fails with an unpublished event, and a retry queues the export again", async () => {
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

  // Every row inserts under this one id, since an inline snapshot takes its message from its call site
  // The rows therefore produce the same message, and afterEach deletes each row's export before the next is inserted
  test.each([DataExportStatus.Building, DataExportStatus.Failed, DataExportStatus.Queued])(
    "generateDataExportLink fails with a %s export",
    async (status) => {
      expect.hasAssertions();

      await mockContext.db.insert(dataExportsInUser).values({ id: refusedDataExportId, status, userId });

      await expect(caller.generateDataExportLink(refusedDataExportId)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, refusedDataExportId).message}]`,
      );
    },
  );

  test("generateDataExportLink fails with another person's export", async () => {
    expect.hasAssertions();

    const otherUser = await createMockUser(mockContext.db);
    const dataExport = await insertReadyDataExport(otherUser.id, unexpiredAt);

    await expect(caller.generateDataExportLink(dataExport.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.DataExport, dataExport.id).message}]`,
    );
  });

  test("generateDataExportLink fails with an expired export", async () => {
    expect.hasAssertions();

    const dataExport = await insertReadyDataExport(userId, expiredAt);

    await expect(caller.generateDataExportLink(dataExport.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, dataExport.id).message}]`,
    );
  });

  // The settings row is named by the user's id, the primary key, so the entry the store issues is the row the header
  // Names
  test("the settings update's entry covers the settings row its header names", async () => {
    expect.hasAssertions();

    const input = { isMuteOnJoin: true };
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(userRouter)(context).upsertUserSettings(input),
      context: mockContext,
      entry: getUpdateUserSettingsEntry(userId, input),
      path: "upsertUserSettings",
      tables: [userSettingsTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });
});
