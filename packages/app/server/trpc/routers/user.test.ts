import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { userRouter } from "@@/server/trpc/routers/user";
import {
  DatabaseEntityType,
  USER_BIOGRAPHY_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  UserStatus,
  userStatuses,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("user", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["user"]>;
  const message = "message";
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
    MockTableDatabase.clear();
    await mockContext.db.delete(userStatuses);
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

  test("fails read statuses with empty user ids", async () => {
    expect.hasAssertions();

    await expect(caller.readStatuses([])).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "origin": "array",
          "code": "too_small",
          "minimum": 1,
          "inclusive": true,
          "path": [],
          "message": "Too small: expected array to have >=1 items"
        }
      ]]
    `);
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
    const returned = await caller.upsertStatus({ message, status });
    vi.advanceTimersByTime(1);
    const userId = getMockSession().user.id;
    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(returned.status).toBe(status);
    expect(returned.userId).toBe(userId);
    expect(userStatus.message).toBe(message);
    expect(userStatus.status).toBe(status);
  });

  test("upsert status updates", async () => {
    expect.hasAssertions();

    await caller.upsertStatus({ message, status: UserStatus.DoNotDisturb });
    vi.advanceTimersByTime(1);
    const returned = await caller.upsertStatus({ message: updatedMessage, status: UserStatus.Idle });
    vi.advanceTimersByTime(1);
    const userId = getMockSession().user.id;
    const userStatus = takeOne(await caller.readStatuses([userId]));

    expect(returned.status).toBe(UserStatus.Idle);
    expect(returned.userId).toBe(userId);
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
    const data = await withAsyncIterator(
      () => onUpsertStatus,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.upsertStatus({ status })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.status).toBe(status);
    expect(data.value.userId).toBe(user.id);
  });

  test(`on upserts status ${UserStatus.Online} with connect`, async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onUpsertStatus,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.connect()]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.status).toBe(UserStatus.Online);
    expect(data.value.userId).toBe(user.id);
  });

  test(`on upserts status ${UserStatus.Offline} with disconnect`, async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onUpsertStatus,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.disconnect()]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.status).toBe(UserStatus.Offline);
    expect(data.value.userId).toBe(user.id);
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

  describe(userRouter.updateUser, () => {
    const biography = "biography";
    const image = "image";
    const name = "name";

    test("updates name", async () => {
      expect.hasAssertions();

      await mockSessionOnce(mockContext.db);
      const updatedUser = await caller.updateUser({ name: ` ${name} ` });

      expect(updatedUser.name).toBe(name);
    });

    test("updates biography", async () => {
      expect.hasAssertions();

      await mockSessionOnce(mockContext.db);
      const updatedUser = await caller.updateUser({ biography });

      expect(updatedUser.biography).toBe(biography);
    });

    test("clears biography", async () => {
      expect.hasAssertions();

      const getSessionPayload = await mockSessionOnce(mockContext.db);
      await caller.updateUser({ biography });
      replayMockSession(getSessionPayload);
      const updatedUser = await caller.updateUser({ biography: null });

      expect(updatedUser.biography).toBeNull();
    });

    test("updates image", async () => {
      expect.hasAssertions();

      await mockSessionOnce(mockContext.db);
      const updatedUser = await caller.updateUser({ image });

      expect(updatedUser.image).toBe(image);
    });

    test("fails with no fields provided", async () => {
      expect.hasAssertions();

      await expect(caller.updateUser({})).rejects.toThrow("At least one of");
    });

    test("fails name exceeds max length", async () => {
      expect.hasAssertions();

      await expect(caller.updateUser({ name: "a".repeat(USER_NAME_MAX_LENGTH + 1) })).rejects.toThrow("Too large");
    });

    test("fails biography exceeds max length", async () => {
      expect.hasAssertions();

      await expect(caller.updateUser({ biography: "a".repeat(USER_BIOGRAPHY_MAX_LENGTH + 1) })).rejects.toThrow(
        "Too large",
      );
    });
  });
});
