import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockAuthSession, createMockCaller } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { filterRouter } from "#server/trpc/routers/room/filter";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { RoomPermission, WordFilterAction } from "@esposter/db-schema";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("filterRouter", () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let roomFilterCaller: DecorateRouterRecord<TRPCRouter["room"]["filter"]>;
  let roomId: string;
  const words = ["a"];
  const updatedWords = ["a", "b"];
  const timeoutDurationMs = 1;
  const position = 1;

  beforeAll(() => {
    mockContext = getMockContext();
    roomFilterCaller = createCallerFactory(filterRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  test("readRoomFilter returns undefined when the room has no filter", async () => {
    expect.hasAssertions();

    const readFilter = await roomFilterCaller.readRoomFilter({ roomId });

    expect(readFilter).toBeUndefined();
  });

  test("readRoomFilter returns the row upsertRoomFilter wrote", async () => {
    expect.hasAssertions();

    await roomFilterCaller.upsertRoomFilter({ roomId, words });
    const readFilter = await roomFilterCaller.readRoomFilter({ roomId });

    expect(readFilter?.words).toStrictEqual(words);
  });

  test("upsertRoomFilter overwrites the word list", async () => {
    expect.hasAssertions();

    await roomFilterCaller.upsertRoomFilter({ roomId, words });
    const upsertedRoomFilter = await roomFilterCaller.upsertRoomFilter({ roomId, words: updatedWords });

    expect(upsertedRoomFilter.words).toStrictEqual(updatedWords);
  });

  test(`upsertRoomFilter persists the ${WordFilterAction.Timeout} action with its duration`, async () => {
    expect.hasAssertions();

    const upsertedRoomFilter = await roomFilterCaller.upsertRoomFilter({
      action: WordFilterAction.Timeout,
      roomId,
      timeoutDurationMs,
      words,
    });

    expect(upsertedRoomFilter.action).toBe(WordFilterAction.Timeout);
    expect(upsertedRoomFilter.timeoutDurationMs).toBe(timeoutDurationMs);
  });

  test(`upsertRoomFilter clears the timeout duration when switching away from ${WordFilterAction.Timeout}`, async () => {
    expect.hasAssertions();

    await roomFilterCaller.upsertRoomFilter({ action: WordFilterAction.Timeout, roomId, timeoutDurationMs, words });
    const upsertedRoomFilter = await roomFilterCaller.upsertRoomFilter({
      action: WordFilterAction.Warn,
      roomId,
      words,
    });

    expect(upsertedRoomFilter.action).toBe(WordFilterAction.Warn);
    expect(upsertedRoomFilter.timeoutDurationMs).toBeNull();
  });

  // The read carries the same gate as the write: the word list is the filter, so a member who can read it can
  // Write around every entry, and the panel being hidden below the permission withholds nothing on its own
  test(`fails readRoomFilter for a member without ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    await roomFilterCaller.upsertRoomFilter({ roomId, words });
    const member = await createMember();
    const memberRoomFilterCaller = await createMockCaller(
      filterRouter,
      await createMockAuthSession(mockContext.db, member),
    );

    await expect(memberRoomFilterCaller.readRoomFilter({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test(`fails upsertRoomFilter for a member without ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    const memberRoomFilterCaller = await createMockCaller(
      filterRouter,
      await createMockAuthSession(mockContext.db, member),
    );

    await expect(memberRoomFilterCaller.upsertRoomFilter({ roomId, words })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test(`upsertRoomFilter succeeds for a member with ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.ManageRoom, position);
    const memberRoomFilterCaller = await createMockCaller(
      filterRouter,
      await createMockAuthSession(mockContext.db, member),
    );
    const upsertedRoomFilter = await memberRoomFilterCaller.upsertRoomFilter({ roomId, words });

    expect(upsertedRoomFilter.words).toStrictEqual(words);
  });
});
