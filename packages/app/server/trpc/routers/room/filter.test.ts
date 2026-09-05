import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { filterRouter } from "@@/server/trpc/routers/room/filter";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { RoomPermission, WordFilterAction } from "@esposter/db-schema";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("filterRouter", () => {
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

  test("readRoomFilter returns null when the room has no filter", async () => {
    expect.hasAssertions();

    const readFilter = await roomFilterCaller.readRoomFilter({ roomId });

    expect(readFilter).toBeNull();
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

  test(`fails upsertRoomFilter for a member without ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);

    await expect(roomFilterCaller.upsertRoomFilter({ roomId, words })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test(`upsertRoomFilter succeeds for a member with ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.ManageRoom, position);
    await mockSessionOnce(mockContext.db, member);
    const upsertedRoomFilter = await roomFilterCaller.upsertRoomFilter({ roomId, words });

    expect(upsertedRoomFilter.words).toStrictEqual(words);
  });
});
