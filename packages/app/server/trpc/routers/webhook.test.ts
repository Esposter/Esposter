import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { webhookRouter } from "@@/server/trpc/routers/webhook";
import { appUsersInMessage, DatabaseEntityType, roomsInMessage, webhooksInMessage } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("webhook", () => {
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let webhookCaller: DecorateRouterRecord<TRPCRouter["webhook"]>;
  let mockContext: Context;
  const name = "name";
  const updatedName = "updatedName";
  const updatedIsActive = false;

  beforeAll(async () => {
    const createRoomCaller = createCallerFactory(roomRouter);
    const createWebhookCaller = createCallerFactory(webhookRouter);
    mockContext = await createMockContext();
    roomCaller = createRoomCaller(mockContext);
    webhookCaller = createWebhookCaller(mockContext);
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

  test("fails create with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(webhookCaller.createWebhook({ name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails create with non-existent creator", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(webhookCaller.createWebhook({ name, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const readWebhooks = await webhookCaller.readWebhooks({ roomId: newRoom.id });

    expect(readWebhooks.some(({ id }) => id === newWebhook.id)).toBe(true);
  });

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(webhookCaller.readWebhooks({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails read with non-existent creator", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(webhookCaller.readWebhooks({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
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

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();

    await expect(
      webhookCaller.updateWebhook({ id, name: updatedName, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Webhook, id).message}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

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

  test("fails rotate token with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

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
    expect(readWebhooks.find(({ id }) => id === newWebhook.id)).toBeUndefined();
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();

    await expect(webhookCaller.deleteWebhook({ id, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Webhook, id).message}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      webhookCaller.deleteWebhook({ id: newWebhook.id, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("reads app users by ids", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    const users = await webhookCaller.readAppUsersByIds({ ids: [newWebhook.userId], roomId: newRoom.id });

    expect(users[0].id).toBe(newWebhook.userId);
  });

  test("fails read app users by empty ids", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(webhookCaller.readAppUsersByIds({ ids: [], roomId: newRoom.id })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "origin": "array",
          "code": "too_small",
          "minimum": 1,
          "inclusive": true,
          "path": [
            "ids"
          ],
          "message": "Too small: expected array to have >=1 items"
        }
      ]]
    `);
  });

  test("fails read app users by ids with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newWebhook = await webhookCaller.createWebhook({ name, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      webhookCaller.readAppUsersByIds({ ids: [newWebhook.userId], roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
