import type { Device } from "#shared/models/auth/Device";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { roleEventEmitter } from "@@/server/services/role/events/roleEventEmitter";
import { createCallerFactory } from "@@/server/trpc";
import { getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { getRoomEventSubscription } from "@@/server/trpc/procedure/room/getRoomEventSubscription";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

const createDevice = (): Device => ({ sessionId: crypto.randomUUID(), userId: crypto.randomUUID() });

describe(getRoomEventSubscription, () => {
  const { getMockContext, getRoleCaller, getRoomCaller, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  const name = "name";

  beforeAll(() => {
    mockContext = getMockContext();
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roleCaller = getRoleCaller();
    roomCaller = getRoomCaller();
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  test("yields event data for the subscribed room", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const onCreateRole = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => onCreateRole,
      () => {
        roleEventEmitter.emit("createRole", [role, createDevice()]);
        return Promise.resolve();
      },
    );

    expect(data).toStrictEqual(role);
  });

  test("does not yield events for other rooms", async () => {
    expect.hasAssertions();

    const otherRoom = await roomCaller.createRoom({ name });
    const otherRole = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId: otherRoom.id });
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const onCreateRole = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => onCreateRole,
      () => {
        roleEventEmitter.emit("createRole", [otherRole, createDevice()]);
        roleEventEmitter.emit("createRole", [role, createDevice()]);
        return Promise.resolve();
      },
    );

    expect(data).toStrictEqual(role);
  });

  test("does not yield events from the same device", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const { session, user } = await mockSessionOnce(mockContext.db, getMockSession().user);
    const onCreateRole = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => onCreateRole,
      () => {
        roleEventEmitter.emit("createRole", [
          { ...role, name: "sameDevice" },
          { sessionId: session.id, userId: user.id },
        ]);
        roleEventEmitter.emit("createRole", [role, createDevice()]);
        return Promise.resolve();
      },
    );

    expect(data).toStrictEqual(role);
  });

  test("yields a device-less event to the device that caused it", async () => {
    expect.hasAssertions();

    const deleteMessageInput = { partitionKey: roomId, rowKey: crypto.randomUUID() };
    const onDeleteMessage = await messageCaller.onDeleteMessage({ roomId });
    const data = await getFirstEmit(
      () => onDeleteMessage,
      () => {
        messageEventEmitter.emit("deleteMessage", [{ partitionKey: crypto.randomUUID(), rowKey: "" }]);
        messageEventEmitter.emit("deleteMessage", [deleteMessageInput]);
        return Promise.resolve();
      },
    );

    expect(data).toStrictEqual(deleteMessageInput);
  });

  test("throws UNAUTHORIZED if not a member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(roleCaller.onCreateRole({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });
});
