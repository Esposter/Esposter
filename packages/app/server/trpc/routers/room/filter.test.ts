import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { filterRouter } from "@@/server/trpc/routers/room/filter";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { RoomPermission, WordFilterAction } from "@esposter/db-schema";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("room/filter", () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let roomFilterCaller: DecorateRouterRecord<TRPCRouter["room"]["filter"]>;
  let roomId: string;
  const words = ["word"];
  const updatedWords = ["word", "updatedword"];
  const timeoutDurationMs = 1;
  const position = 5;

  beforeAll(() => {
    mockContext = getMockContext();
    roomFilterCaller = createCallerFactory(filterRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  describe("readRoomFilter", () => {
    test("returns null when no filter configured", async () => {
      expect.hasAssertions();

      const readFilter = await roomFilterCaller.readRoomFilter({ roomId });

      expect(readFilter).toBeNull();
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

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(roomFilterCaller.upsertRoomFilter({ roomId, words })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: UNAUTHORIZED]`,
      );
    });

    test(`member with ${RoomPermission.ManageRoom} permission can upsertRoomFilter`, async () => {
      expect.hasAssertions();

      const { member } = await setupMemberWithRole(RoomPermission.ManageRoom, position);
      await mockSessionOnce(mockContext.db, member);

      const result = await roomFilterCaller.upsertRoomFilter({ roomId, words });

      expect(result.words).toStrictEqual(words);
    });
  });
});
