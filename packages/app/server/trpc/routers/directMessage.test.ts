import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { directMessageRouter } from "@@/server/trpc/routers/directMessage";
import { rooms } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("directMessage", () => {
  let caller: DecorateRouterRecord<TRPCRouter["directMessage"]>;
  let mockContext: Context;

  beforeAll(async () => {
    const createCaller = createCallerFactory(directMessageRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("creates direct message", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);

    expect(directMessage.type).toBe("DirectMessage");
    expect(directMessage.participantKey).toContain(user.id);
    expect(directMessage.participantKey).toContain(getMockSession().user.id);
  });

  test("creates direct message to be idempotent", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage1 = await caller.createDirectMessage([user.id]);
    const directMessage2 = await caller.createDirectMessage([user.id]);

    expect(directMessage1.id).toBe(directMessage2.id);
  });

  test("creates direct message to be idempotent regardless of order", async () => {
    expect.hasAssertions();

    const initialUserId = getMockSession().user.id;
    const { user: userB } = await mockSessionOnce(mockContext.db);
    // Session is now userB — userB creates DM with initialUser
    const directMessage1 = await caller.createDirectMessage([initialUserId]);
    // Session reverts to initialUser — initialUser creates DM with userB (reverse order)
    const directMessage2 = await caller.createDirectMessage([userB.id]);

    expect(directMessage1.id).toBe(directMessage2.id);
  });

  test("reads direct messages", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);
    const readDirectMessages = await caller.readDirectMessages();

    expect(readDirectMessages.items).toHaveLength(1);
    expect(takeOne(readDirectMessages.items).id).toBe(directMessage.id);
  });

  test("reads direct messages excluding hidden", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);
    await caller.hideDirectMessage(directMessage.id);
    const readDirectMessages = await caller.readDirectMessages();

    expect(readDirectMessages.items).toHaveLength(0);
  });

  test("hides direct message", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);

    await expect(caller.hideDirectMessage(directMessage.id)).resolves.toBeUndefined();
  });

  test("fails hide with non-member", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);
    await mockSessionOnce(mockContext.db);

    await expect(caller.hideDirectMessage(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("unhides direct message on re-open", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);
    await caller.hideDirectMessage(directMessage.id);
    await caller.createDirectMessage([user.id]);
    const readDirectMessages = await caller.readDirectMessages();

    expect(readDirectMessages.items).toHaveLength(1);
    expect(takeOne(readDirectMessages.items).id).toBe(directMessage.id);
  });

  test("reads direct message participants", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);
    const participantsData = await caller.readDirectMessageParticipants([directMessage.id]);

    expect(participantsData).toHaveLength(1);

    const entry = takeOne(participantsData);

    expect(entry.roomId).toBe(directMessage.id);
    expect(entry.participants).toHaveLength(1);
    expect(takeOne(entry.participants).id).toBe(user.id);
  });

  test("fails read direct message participants with non-member room", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const directMessage = await caller.createDirectMessage([user.id]);
    await mockSessionOnce(mockContext.db);

    const participantsData = await caller.readDirectMessageParticipants([directMessage.id]);

    // Non-member gets empty result (filtered out by membership join)
    expect(participantsData).toHaveLength(0);
  });

  test("fails create direct message with invalid operation", async () => {
    expect.hasAssertions();

    await expect(caller.createDirectMessage([])).rejects.toThrowErrorMatchingInlineSnapshot(`
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
});
