import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { roomFilterRouter } from "@@/server/trpc/routers/roomFilter";
import { RoomPermission, roomsInMessage } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("roomFilter", () => {
  let mockContext: Context;
  let roomFilterCaller: DecorateRouterRecord<TRPCRouter["roomFilter"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomId: string;
  const name = "name";
  const words = ["word"];
  const updatedWords = ["word", "updatedWord"];

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

    test("returns words after upsertRoomFilter", async () => {
      expect.hasAssertions();

      await roomFilterCaller.upsertRoomFilter({ roomId, words });
      const readWords = await roomFilterCaller.readRoomFilter({ roomId });

      expect(readWords).toStrictEqual(words);
    });
  });

  describe("upsertRoomFilter", () => {
    test("owner can set and overwrite word list", async () => {
      expect.hasAssertions();

      await roomFilterCaller.upsertRoomFilter({ roomId, words });
      const result = await roomFilterCaller.upsertRoomFilter({ roomId, words: updatedWords });

      expect(result.words).toStrictEqual(updatedWords);
    });

    test(`member without ${RoomPermission.ManageRoom} permission cannot upsertRoomFilter — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const inviteCode = await roomCaller.createInvite({ roomId });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(inviteCode);
      await mockSessionOnce(mockContext.db, user);

      await expect(roomFilterCaller.upsertRoomFilter({ roomId, words })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: UNAUTHORIZED]`,
      );
    });

    test(`member with ${RoomPermission.ManageRoom} permission can upsertRoomFilter`, async () => {
      expect.hasAssertions();

      const inviteCode = await roomCaller.createInvite({ roomId });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(inviteCode);
      const role = await roleCaller.createRole({
        name: crypto.randomUUID(),
        permissions: RoomPermission.ManageRoom,
        position: 5,
        roomId,
      });
      await roleCaller.assignRole({ roleId: role.id, roomId, userId: user.id });
      await mockSessionOnce(mockContext.db, user);

      const result = await roomFilterCaller.upsertRoomFilter({ roomId, words });

      expect(result.words).toStrictEqual(words);
    });
  });
});
