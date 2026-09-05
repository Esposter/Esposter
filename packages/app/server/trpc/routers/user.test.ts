import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { MAX_CALL_BACKGROUND_SIZE_BYTES, MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { getCallBackgroundBlobName } from "@@/server/services/message/call/getCallBackgroundBlobName";
import { getCallBackgroundPrefix } from "@@/server/services/message/call/getCallBackgroundPrefix";
import { createCallerFactory } from "@@/server/trpc";
import {
  consumeMockSessionOnce,
  createMockContext,
  getMockSession,
  mockNoSessionOnce,
  mockSessionOnce,
} from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { userRouter } from "@@/server/trpc/routers/user";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { AzureContainer, DatabaseEntityType, UserStatus, userStatusesInMessage } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL, MockContainerDatabase, MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const getCallBackgroundErrorMessage = (context: string) =>
  new InvalidOperationError(Operation.Create, DatabaseEntityType.CallBackground, context).message;
const seedSlots = (userId: string, slots: number[], slotSize: number) => {
  MockContainerDatabase.set(
    AzureContainer.PrivateUserAssets,
    new Map(slots.map((slot) => [getCallBackgroundBlobName(userId, slot), Buffer.alloc(slotSize)])),
  );
};

describe("userRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["user"]>;
  const biography = "biography";
  const image = "image";
  const message = "message";
  const mimetype = "image/png";
  const name = "name";
  const size = 1;
  const updatedMessage = "updatedMessage";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(userRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(userStatusesInMessage);
  });

  test("reads empty statuses with default values", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(userStatus.expiresAt).toBeNull();
    expect(userStatus.message).toBe("");
    expect(userStatus.status).toBe(UserStatus.Online);
    expect(userStatus.userId).toBe(userId);
  });

  test("connect inserts", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const oldUserStatus = takeOne(await caller.readStatuses([userId]));
    vi.advanceTimersByTime(1);
    await caller.connect();
    vi.advanceTimersByTime(1);
    const newUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 1);
  });

  test("connect updates", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await caller.connect();
    vi.advanceTimersByTime(1);
    const oldUserStatus = takeOne(await caller.readStatuses([userId]));
    vi.advanceTimersByTime(1);
    await caller.connect();
    vi.advanceTimersByTime(1);
    const newUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 2);
  });

  test("disconnect inserts", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const oldUserStatus = takeOne(await caller.readStatuses([userId]));
    vi.advanceTimersByTime(1);
    await caller.disconnect();
    vi.advanceTimersByTime(1);
    const newUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 1);
  });

  test("disconnect updates", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await caller.disconnect();
    vi.advanceTimersByTime(1);
    const oldUserStatus = takeOne(await caller.readStatuses([userId]));
    vi.advanceTimersByTime(1);
    await caller.disconnect();
    vi.advanceTimersByTime(1);
    const newUserStatus = takeOne(await caller.readStatuses([userId]));

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 2);
  });

  test("connect disconnect connect", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
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
    const userId = getMockSession().user.id;
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
    const userId = getMockSession().user.id;
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
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const status = UserStatus.Online;
    const data = await getFirstEmit(
      () => onUpsertStatus,
      () => caller.upsertStatus({ status }),
    );

    expect(data.status).toBe(status);
    expect(data.userId).toBe(user.id);
  });

  test(`on upserts status ${UserStatus.Online} with connect`, async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await consumeMockSessionOnce();
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const data = await getFirstEmit(
      () => onUpsertStatus,
      () => caller.connect(),
    );

    expect(data.status).toBe(UserStatus.Online);
    expect(data.userId).toBe(user.id);
  });

  test(`on upserts status ${UserStatus.Offline} with disconnect`, async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await consumeMockSessionOnce();
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const data = await getFirstEmit(
      () => onUpsertStatus,
      () => caller.disconnect(),
    );

    expect(data.status).toBe(UserStatus.Offline);
    expect(data.userId).toBe(user.id);
  });

  test("fails on upserts status with self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
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

    const userId = getMockSession().user.id;
    const { publicUrl, sasUrl } = await caller.generateProfileImageUploadUrl();

    expect(publicUrl).toBe(`${MOCK_BLOB_BASE_URL}/${AzureContainer.PublicUserAssets}/${userId}/ProfileImage`);
    expect(sasUrl).toBe(
      `${MOCK_BLOB_BASE_URL}/${AzureContainer.PublicUserAssets}/${userId}/ProfileImage?sv=2025-11-05&sr=b&sig=mock-signature&st=1970-01-01T00:00:00Z&se=2099-12-31T23:59:59Z&sp=w`,
    );
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

    const userId = getMockSession().user.id;
    seedSlots(userId, [0, 2], size);

    await expect(caller.readCallBackgrounds()).resolves.toStrictEqual([
      { sasUrl: expect.stringContaining(getCallBackgroundBlobName(userId, 0)) as string, slot: 0 },
      { sasUrl: expect.stringContaining(getCallBackgroundBlobName(userId, 2)) as string, slot: 2 },
    ]);
  });

  test("readCallBackgrounds passes over a blob under the prefix that is not one of the slots", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    MockContainerDatabase.set(
      AzureContainer.PrivateUserAssets,
      new Map([[`${getCallBackgroundPrefix(userId)}notASlot`, Buffer.alloc(size)]]),
    );
    const callBackgrounds = await caller.readCallBackgrounds();

    // Never listed, and never reclaimed on a guess either — nothing is published for a name this router did
    // Not mint
    expect(callBackgrounds).toStrictEqual([]);
    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  test("readCallBackgrounds drops a slot over the size cap and reclaims it", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    seedSlots(userId, [0], MAX_CALL_BACKGROUND_SIZE_BYTES + 1);
    const callBackgrounds = await caller.readCallBackgrounds();
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    expect(callBackgrounds).toStrictEqual([]);
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [getCallBackgroundBlobName(userId, 0)],
      containerName: AzureContainer.PrivateUserAssets,
    });
  });

  // A slot the caller already holds is a replacement, not a collision — and one freed a moment ago is still
  // In the listing until a worker reclaims it, which is exactly why nothing here reads that listing
  test("generateCallBackgroundUploadUrl mints a write target for the slot it is given, occupied or not", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    seedSlots(
      userId,
      Array.from({ length: MAX_CALL_BACKGROUNDS }, (_, slot) => slot),
      size,
    );

    await expect(caller.generateCallBackgroundUploadUrl({ mimetype, size, slot: 3 })).resolves.toContain(
      getCallBackgroundBlobName(userId, 3),
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

    const input = { mimetype: "application/pdf", size, slot: 0 };

    await expect(caller.generateCallBackgroundUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getCallBackgroundErrorMessage(JSON.stringify({ mimetype: input.mimetype, size: input.size }))}]`,
    );
  });

  test("deleteCallBackground publishes a bounded prefix deletion so a re-upload survives a replay", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    seedSlots(userId, [0], size);
    await caller.deleteCallBackground({ slot: 0 });
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    // The bound is what stops a redelivered delete taking the image that replaced the one it named
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      containerName: AzureContainer.PrivateUserAssets,
      createdBefore: new Date(),
      prefix: getCallBackgroundBlobName(userId, 0),
    });
  });
});
