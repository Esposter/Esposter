import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { userRouter } from "@@/server/trpc/routers/user";
import { UserStatus, userStatuses } from "@esposter/db-schema";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("user", () => {
  let caller: DecorateRouterRecord<TRPCRouter["user"]>;
  let mockContext: Context;
  const message = "message";
  const updatedMessage = "updatedMessage";

  beforeAll(async () => {
    const createCaller = createCallerFactory(userRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockContext.db.delete(userStatuses);
  });

  test("reads empty statuses with default values", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const userStatus = (await caller.readStatuses([userId]))[0];

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

    const oldUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];
    vi.advanceTimersByTime(1);
    await caller.connect();
    const newUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 1);
  });

  test("connect updates", async () => {
    expect.hasAssertions();

    await caller.connect();
    const oldUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];
    vi.advanceTimersByTime(1);
    await caller.connect();
    const newUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 1);
  });

  test("disconnect inserts", async () => {
    expect.hasAssertions();

    const oldUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];
    vi.advanceTimersByTime(1);
    await caller.disconnect();
    const newUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 1);
  });

  test("disconnect updates", async () => {
    expect.hasAssertions();

    await caller.disconnect();
    const oldUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];
    vi.advanceTimersByTime(1);
    await caller.disconnect();
    const newUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(newUserStatus.updatedAt.getTime()).toBe(oldUserStatus.updatedAt.getTime() + 1);
  });

  test("connect disconnect connect", async () => {
    expect.hasAssertions();

    await caller.connect();
    await caller.disconnect();
    const oldUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(oldUserStatus.status).toBe(UserStatus.Offline);

    await caller.connect();
    const newUserStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(newUserStatus.status).toBe(UserStatus.Online);
  });

  test("upsert status inserts", async () => {
    expect.hasAssertions();

    await caller.upsertStatus({ message });
    const userStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(userStatus.message).toBe(message);
  });

  test("upsert status updates", async () => {
    expect.hasAssertions();

    await caller.upsertStatus({ message });
    await caller.upsertStatus({ message: updatedMessage });
    const userStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(userStatus.message).toBe(updatedMessage);
  });

  test("on upserts status", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    // It's stupid I know, but we need to refresh back to our original user
    // since we need to listen to a new mock user with a valid id using our original user
    getMockSession();
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const status = UserStatus.Online;
    const [data] = await Promise.all([onUpsertStatus[Symbol.asyncIterator]().next(), caller.upsertStatus({ status })]);

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
    const [data] = await Promise.all([onUpsertStatus[Symbol.asyncIterator]().next(), caller.connect()]);

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
    const [data] = await Promise.all([onUpsertStatus[Symbol.asyncIterator]().next(), caller.disconnect()]);

    assert(!data.done);

    expect(data.value.status).toBe(UserStatus.Offline);
    expect(data.value.userId).toBe(user.id);
  });
});
