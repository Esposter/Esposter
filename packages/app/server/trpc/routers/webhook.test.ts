import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { webhookRouter } from "@@/server/trpc/routers/webhook";
import {
  appUsersInMessage,
  DatabaseEntityType,
  RoomPermission,
  roomsInMessage,
  webhooksInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("webhookRouter", () => {
  let mockContext: Context;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let webhookCaller: DecorateRouterRecord<TRPCRouter["webhook"]>;
  const name = "name";
  const updatedName = "updatedName";
  const updatedIsActive = false;

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    webhookCaller = createCallerFactory(webhookRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(webhooksInMessage);
    await mockContext.db.delete(appUsersInMessage);
    await mockContext.db.delete(roomsInMessage);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const appUser = await mockContext.db.query.appUsersInMessage.findFirst();

    assert(appUser);

    expect(newWebhook.name).toBe(name);
    expect(newWebhook.isActive).toBe(true);
    expect(newWebhook.token).toBeTypeOf("string");
    expect(newWebhook.userId).toBe(appUser.id);
  });

  test("fails create with max webhooks", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const input: CreateWebhookInput = { name, roomId: newRoom.id };
    await Promise.all(Array.from({ length: WEBHOOK_MAX_LENGTH }).map(() => webhookCaller.createWebhook(input)));

    await expect(webhookCaller.createWebhook(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Webhook, JSON.stringify(input)).message}]`,
    );
  });

  // Unauthorized rather than not-found, so a caller cannot probe which room ids exist by the code it gets back
  test("fails create with an unknown room id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(webhookCaller.createWebhook({ name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test(`fails create for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite.id);
    await mockSessionOnce(mockContext.db, user);

    await expect(webhookCaller.createWebhook({ name, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const readWebhooks = await webhookCaller.readWebhooks({ roomId: newRoom.id });
    const readWebhook = takeOne(readWebhooks);

    expect(readWebhooks).toHaveLength(1);
    expect(readWebhook.id).toBe(newWebhook.id);
    expect(readWebhook.roomId).toBe(newRoom.id);
    expect(readWebhook.userId).toBe(newWebhook.userId);
  });

  test("reads empty webhooks", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readWebhooks = await webhookCaller.readWebhooks({ roomId: newRoom.id });

    expect(readWebhooks).toStrictEqual([]);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const updatedWebhook = await webhookCaller.updateWebhook({
      id: newWebhook.id,
      isActive: updatedIsActive,
      name: updatedName,
      roomId: newRoom.id,
    });

    expect(updatedWebhook.name).toBe(updatedName);
    expect(updatedWebhook.isActive).toBe(updatedIsActive);
  });

  test(`fails update for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite.id);
    await mockSessionOnce(mockContext.db, user);

    await expect(
      webhookCaller.updateWebhook({ id: newWebhook.id, name: updatedName, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("rotates token", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const previousToken = newWebhook.token;
    const rotatedWebhook = await webhookCaller.rotateToken({ id: newWebhook.id, roomId: newRoom.id });

    expect(rotatedWebhook.token).not.toBe(previousToken);
  });

  test(`fails rotate token for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite.id);
    await mockSessionOnce(mockContext.db, user);

    await expect(
      webhookCaller.rotateToken({ id: newWebhook.id, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const deletedWebhook = await webhookCaller.deleteWebhook({ id: newWebhook.id, roomId: newRoom.id });
    const readWebhooks = await webhookCaller.readWebhooks({ roomId: newRoom.id });
    const appUser = await mockContext.db.query.appUsersInMessage.findFirst();

    expect(appUser).toBeUndefined();
    expect(deletedWebhook.id).toBe(newWebhook.id);
    expect(readWebhooks).toStrictEqual([]);
  });

  test(`fails delete for a member without ${RoomPermission.ManageWebhooks} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite.id);
    await mockSessionOnce(mockContext.db, user);

    await expect(
      webhookCaller.deleteWebhook({ id: newWebhook.id, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("reads app users by ids", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const users = await webhookCaller.readAppUsers({ ids: [newWebhook.userId], roomId: newRoom.id });

    expect(takeOne(users).id).toBe(newWebhook.userId);
  });

  test("fails read app users by ids with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      webhookCaller.readAppUsers({ ids: [newWebhook.userId], roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
