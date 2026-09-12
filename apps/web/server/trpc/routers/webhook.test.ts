import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { webhookRouter } from "@@/server/trpc/routers/webhook";
import { appUsersInMessage, DatabaseEntityType, RoomPermission, webhooksInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("webhookRouter", () => {
  const { createMember, getMockContext, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let webhookCaller: DecorateRouterRecord<TRPCRouter["webhook"]>;
  let roomId: string;
  const name = "name";
  const updatedName = "updatedName";
  const updatedIsActive = false;
  // A member of the room who holds no permission, replayed as the caller of the guarded call
  const mockMemberSessionOnce = async () => {
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
  };

  beforeAll(() => {
    mockContext = getMockContext();
    webhookCaller = createCallerFactory(webhookRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  afterEach(async () => {
    await mockContext.db.delete(webhooksInMessage);
    await mockContext.db.delete(appUsersInMessage);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    const appUser = await mockContext.db.query.appUsersInMessage.findFirst();

    assert.exists(appUser);

    expect(newWebhook.name).toBe(name);
    expect(newWebhook.isActive).toBe(true);
    expect(newWebhook.token).toBeTypeOf("string");
    expect(newWebhook.userId).toBe(appUser.id);
  });

  test("fails create with max webhooks", async () => {
    expect.hasAssertions();

    const input: CreateWebhookInput = { name, roomId };
    await Promise.all(Array.from({ length: WEBHOOK_MAX_LENGTH }).map(() => webhookCaller.createWebhook(input)));

    await expect(webhookCaller.createWebhook(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Webhook, JSON.stringify(input)).message}]`,
    );
  });

  // Unauthorized rather than not-found, so a caller cannot probe which room ids exist by the code it gets back
  test("fails create with an unknown room id", async () => {
    expect.hasAssertions();

    await expect(
      webhookCaller.createWebhook({ name, roomId: crypto.randomUUID() }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test(`fails create for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    await mockMemberSessionOnce();

    await expect(webhookCaller.createWebhook({ name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    const readWebhooks = await webhookCaller.readWebhooks({ roomId });
    const readWebhook = takeOne(readWebhooks);

    expect(readWebhooks).toHaveLength(1);
    expect(readWebhook.id).toBe(newWebhook.id);
    expect(readWebhook.roomId).toBe(roomId);
    expect(readWebhook.userId).toBe(newWebhook.userId);
  });

  test("reads empty webhooks", async () => {
    expect.hasAssertions();

    const readWebhooks = await webhookCaller.readWebhooks({ roomId });

    expect(readWebhooks).toStrictEqual([]);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    const updatedWebhook = await webhookCaller.updateWebhook({
      id: newWebhook.id,
      isActive: updatedIsActive,
      name: updatedName,
      roomId,
    });

    expect(updatedWebhook.name).toBe(updatedName);
    expect(updatedWebhook.isActive).toBe(updatedIsActive);
  });

  test(`fails update for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    await mockMemberSessionOnce();

    await expect(
      webhookCaller.updateWebhook({ id: newWebhook.id, name: updatedName, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("rotates token", async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    const rotatedWebhook = await webhookCaller.rotateToken({ id: newWebhook.id, roomId });

    expect(rotatedWebhook.token).not.toBe(newWebhook.token);
  });

  test(`fails rotate token for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    await mockMemberSessionOnce();

    await expect(webhookCaller.rotateToken({ id: newWebhook.id, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    const deletedWebhook = await webhookCaller.deleteWebhook({ id: newWebhook.id, roomId });
    const readWebhooks = await webhookCaller.readWebhooks({ roomId });
    const appUser = await mockContext.db.query.appUsersInMessage.findFirst();

    expect(appUser).toBeUndefined();
    expect(deletedWebhook.id).toBe(newWebhook.id);
    expect(readWebhooks).toStrictEqual([]);
  });

  test(`fails delete for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    await mockMemberSessionOnce();

    await expect(webhookCaller.deleteWebhook({ id: newWebhook.id, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads app users by ids", async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    const users = await webhookCaller.readAppUsers({ ids: [newWebhook.userId], roomId });

    expect(takeOne(users).id).toBe(newWebhook.userId);
  });

  test("fails read app users by ids for a non-member", async () => {
    expect.hasAssertions();

    const newWebhook = await webhookCaller.createWebhook({ name, roomId });
    await mockSessionOnce(mockContext.db);

    await expect(
      webhookCaller.readAppUsers({ ids: [newWebhook.userId], roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
