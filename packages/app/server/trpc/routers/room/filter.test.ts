import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { filterRouter } from "@@/server/trpc/routers/room/filter";
import { RoomPermission, roomsInMessage, WordFilterAction } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("room/filter", () => {
  let mockContext: Context;
  let roomFilterCaller: DecorateRouterRecord<TRPCRouter["room"]["filter"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomId: string;
  const name = "name";
  const words = ["word"];
  const updatedWords = ["word", "updatedword"];
  const timeoutDurationMs = 1;

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomFilterCaller = createCallerFactory(filterRouter)(mockContext);
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
    test("returns undefined when no filter configured", async () => {
      expect.hasAssertions();

      const readFilter = await roomFilterCaller.readRoomFilter({ roomId });

      expect(readFilter).toBeUndefined();
    });

    test("returns the filter row after upsertRoomFilter", async () => {
      expect.hasAssertions();

      await roomFilterCaller.upsertRoomFilter({ roomId, words });
      const readFilter = await roomFilterCaller.readRoomFilter({ roomId });

      expect(readFilter?.words).toStrictEqual(words);
    });
  });

  describe("upsertRoomFilter", () => {
    test("owner can set and overwrite word list", async () => {
      expect.hasAssertions();

      await roomFilterCaller.upsertRoomFilter({ roomId, words });
      const result = await roomFilterCaller.upsertRoomFilter({ roomId, words: updatedWords });

      expect(result.words).toStrictEqual(updatedWords);
    });

    test(`persists the ${WordFilterAction.Timeout} action with its duration`, async () => {
      expect.hasAssertions();

      const result = await roomFilterCaller.upsertRoomFilter({
        action: WordFilterAction.Timeout,
        roomId,
        timeoutDurationMs,
        words,
      });

      expect(result.action).toBe(WordFilterAction.Timeout);
      expect(result.timeoutDurationMs).toBe(timeoutDurationMs);
    });

    test(`clears the timeout duration when switching away from ${WordFilterAction.Timeout}`, async () => {
      expect.hasAssertions();

      await roomFilterCaller.upsertRoomFilter({ action: WordFilterAction.Timeout, roomId, timeoutDurationMs, words });
      const result = await roomFilterCaller.upsertRoomFilter({ action: WordFilterAction.Warn, roomId, words });

      expect(result.action).toBe(WordFilterAction.Warn);
      expect(result.timeoutDurationMs).toBeNull();
    });

    test(`member without ${RoomPermission.ManageRoom} permission cannot upsertRoomFilter — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      await mockSessionOnce(mockContext.db, user);

      await expect(roomFilterCaller.upsertRoomFilter({ roomId, words })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: UNAUTHORIZED]`,
      );
    });

    test(`member with ${RoomPermission.ManageRoom} permission can upsertRoomFilter`, async () => {
      expect.hasAssertions();

      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
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
