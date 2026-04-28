import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomFilterRouter } from "@@/server/trpc/routers/roomFilter";
import { roomRouter } from "@@/server/trpc/routers/room";
import { roleRouter } from "@@/server/trpc/routers/role";
import { RoomPermission, roomsInMessage } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("roomFilter", () => {
  let mockContext: Context;
  let roomFilterCaller: DecorateRouterRecord<TRPCRouter["roomFilter"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomId: string;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomFilterCaller = createCallerFactory(roomFilterRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    roleCaller = createCallerFactory(roleRouter)(mockContext);
  });

  beforeEach(async () => {
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    await mockContext.db.delete(roomsInMessage);
  });

  describe("readRoomFilter", () => {
    test("returns empty array when no filter configured", async () => {
      expect.hasAssertions();
      const words = await roomFilterCaller.readRoomFilter({ roomId });
      expect(words).toStrictEqual([]);
    });

    test("returns words after updateRoomFilter", async () => {
      expect.hasAssertions();
      await roomFilterCaller.updateRoomFilter({ roomId, words: ["spam", "badword"] });
      const words = await roomFilterCaller.readRoomFilter({ roomId });
      expect(words).toStrictEqual(["spam", "badword"]);
    });
  });

  describe("updateRoomFilter", () => {
    test("owner can set and overwrite word list", async () => {
      expect.hasAssertions();
      await roomFilterCaller.updateRoomFilter({ roomId, words: ["spam"] });
      await roomFilterCaller.updateRoomFilter({ roomId, words: ["spam", "badword"] });
      const words = await roomFilterCaller.readRoomFilter({ roomId });
      expect(words).toStrictEqual(["spam", "badword"]);
    });

    test(`member without ${RoomPermission.ManageRoom} permission cannot updateRoomFilter — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.createMembers({ roomId, userIds: [user.id] });
      await mockSessionOnce(mockContext.db, user);

      await expect(
        roomFilterCaller.updateRoomFilter({ roomId, words: ["spam"] }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    });

    test(`member with ${RoomPermission.ManageRoom} permission can updateRoomFilter`, async () => {
      expect.hasAssertions();
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.createMembers({ roomId, userIds: [user.id] });
      await roleCaller.createRole({
        name: crypto.randomUUID(),
        permissions: RoomPermission.ManageRoom,
        position: 5,
        roomId,
      });
      const role = await roleCaller.createRole({
        name: crypto.randomUUID(),
        permissions: RoomPermission.ManageRoom,
        position: 5,
        roomId,
      });
      await roleCaller.assignRole({ roleId: role.id, roomId, userId: user.id });
      await mockSessionOnce(mockContext.db, user);

      await expect(roomFilterCaller.updateRoomFilter({ roomId, words: ["spam"] })).resolves.toBeUndefined();
    });
  });
});
