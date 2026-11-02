import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { Device } from "#shared/models/auth/Device";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { messageEventEmitter } from "#server/services/message/events/messageEventEmitter";
import { roomEventEmitter } from "#server/services/message/events/roomEventEmitter";
import { roleEventEmitter } from "#server/services/role/events/roleEventEmitter";
import { createCallerFactory } from "#server/trpc";
import { getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { getRoomEventSubscription } from "#server/trpc/procedure/room/getRoomEventSubscription";
import { getFirstEmit } from "#server/trpc/routers/getFirstEmit.test";
import { messageRouter } from "#server/trpc/routers/message";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { withAsyncIterator } from "#server/trpc/routers/withAsyncIterator.test";
import { getReverseTickedTimestamp } from "@esposter/db-schema";
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

    const role = await roleCaller.createRole({ name, roomId });
    const subscription = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => subscription,
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
    const otherRole = await roleCaller.createRole({ name, roomId: otherRoom.id });
    const role = await roleCaller.createRole({ name, roomId });
    const subscription = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => subscription,
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

    const role = await roleCaller.createRole({ name, roomId });
    const { session, user } = await mockSessionOnce(mockContext.db, getMockSession().user);
    const subscription = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => subscription,
      () => {
        roleEventEmitter.emit("createRole", [
          { ...role, name: " " },
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

    const deleteMessageInput = { partitionKey: roomId, rowKey: getReverseTickedTimestamp() };
    const subscription = await messageCaller.onDeleteMessage({ roomId });
    const data = await getFirstEmit(
      () => subscription,
      () => {
        messageEventEmitter.emit("deleteMessage", [
          { partitionKey: crypto.randomUUID(), rowKey: getReverseTickedTimestamp() },
        ]);
        messageEventEmitter.emit("deleteMessage", [deleteMessageInput]);
        return Promise.resolve();
      },
    );

    expect(data).toStrictEqual(deleteMessageInput);
  });

  test("keeps yielding through another member's departure", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, roomId });
    const subscription = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => subscription,
      () => {
        roomEventEmitter.emit("leaveRoom", { roomId, sessionId: crypto.randomUUID(), userId: crypto.randomUUID() });
        roleEventEmitter.emit("createRole", [role, createDevice()]);
        return Promise.resolve();
      },
    );

    expect(data).toStrictEqual(role);
  });

  test("ends the stream when the subscriber leaves the room", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, roomId });
    const subscription = await roleCaller.onCreateRole({ roomId });
    const trigger = () => {
      roomEventEmitter.emit("leaveRoom", { roomId, sessionId: crypto.randomUUID(), userId: getMockSession().user.id });
      // The room still raises an event after the departure, which a stream still open would yield
      roleEventEmitter.emit("createRole", [role, createDevice()]);
      return Promise.resolve();
    };
    const result = await withAsyncIterator(
      () => subscription,
      async (iterator) => {
        const [next] = await Promise.all([iterator.next(), trigger()]);
        return next;
      },
    );

    expect(result.done).toBe(true);
  });

  test("throws UNAUTHORIZED if not a member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(roleCaller.onCreateRole({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });
});
