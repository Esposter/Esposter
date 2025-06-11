import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { userStatuses } from "#shared/db/schema/userStatuses";
import { UserStatus } from "#shared/models/db/UserStatus";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { userRouter } from "@@/server/trpc/routers/user";
import { NIL } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

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

  afterEach(async () => {
    await mockContext.db.delete(userStatuses);
  });

  test("reads empty statuses with default values", async () => {
    expect.hasAssertions();

    const userStatus = (await caller.readStatuses([NIL]))[0];

    expect(userStatus.expiresAt).toBeNull();
    expect(userStatus.message).toBe("");
    expect(userStatus.status).toBe(UserStatus.Online);
    expect(userStatus.userId).toBe(NIL);
  });

  test("fails read empty statuses with empty user ids", async () => {
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

  test("upsert inserts", async () => {
    expect.hasAssertions();

    await caller.upsertStatus({ message });
    const userStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(userStatus.message).toBe(message);
  });

  test("upsert updates", async () => {
    expect.hasAssertions();

    await caller.upsertStatus({ message });
    await caller.upsertStatus({ message: updatedMessage });
    const userStatus = (await caller.readStatuses([getMockSession().user.id]))[0];

    expect(userStatus.message).toBe(updatedMessage);
  });

  test("on upserts status", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    // It's stupid I know, but we need to refresh back to our old user
    // we just need a new mock user with a valid user id
    getMockSession();
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const status = UserStatus.Online;
    const [data] = await Promise.all([
      onUpsertStatus[Symbol.asyncIterator]().next(),
      await caller.upsertStatus({ status }),
    ]);

    assert(!data.done);

    expect(data.value.status).toBe(status);
    expect(data.value.userId).toBe(user.id);
  });

  test("on upserts status with default Offline", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const onUpsertStatus = await caller.onUpsertStatus([user.id]);
    await mockSessionOnce(mockContext.db, user);
    const [data] = await Promise.all([onUpsertStatus[Symbol.asyncIterator]().next(), await caller.upsertStatus()]);

    assert(!data.done);

    expect(data.value.status).toBe(UserStatus.Offline);
  });
});
