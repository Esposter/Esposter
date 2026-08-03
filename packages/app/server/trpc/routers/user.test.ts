import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockNoSessionOnce, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { userRouter } from "@@/server/trpc/routers/user";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { AzureContainer, DatabaseEntityType, UserStatus, userStatusesInMessage } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL, MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("user", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["user"]>;
  const biography = "biography";
  const image = "image";
  const message = "message";
  const name = "name";
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
    const returnedUserStatus = await caller.upsertStatus({ message, status });
    vi.advanceTimersByTime(1);
    const userId = getMockSession().user.id;
    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(returnedUserStatus.status).toBe(status);
    expect(returnedUserStatus.userId).toBe(userId);
    expect(userStatus.message).toBe(message);
    expect(userStatus.status).toBe(status);
  });

  test("upsert status updates", async () => {
    expect.hasAssertions();

    await caller.upsertStatus({ message, status: UserStatus.DoNotDisturb });
    vi.advanceTimersByTime(1);
    const returnedUserStatus = await caller.upsertStatus({ message: updatedMessage, status: UserStatus.Idle });
    vi.advanceTimersByTime(1);
    const userId = getMockSession().user.id;
    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(returnedUserStatus.status).toBe(UserStatus.Idle);
    expect(returnedUserStatus.userId).toBe(userId);
    expect(userStatus.message).toBe(updatedMessage);
    expect(userStatus.status).toBe(UserStatus.Idle);
  });

  test("on upserts status", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    // It's stupid I know, but we need to refresh back to our original user
    // Since we need to listen to a new mock user with a valid id using our original user
    getMockSession();
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
    getMockSession();
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
    getMockSession();
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
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserStatus, userRouter.onUpsertStatus.name).message}]`,
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
    const readUser = await caller.readUser(user.id);

    // Only the allowlisted columns are projected — private fields (email) never leave the database
    expect(readUser).toStrictEqual({ biography, image, name });
  });

  test("reads user unauthenticated", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await caller.updateUser({ biography, image, name });
    mockNoSessionOnce();
    const readUser = await caller.readUser(user.id);

    expect(readUser).toStrictEqual({ biography, image, name });
  });

  test("fails read user with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.readUser("-1")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.User, "-1").message}]`,
    );
  });
});
