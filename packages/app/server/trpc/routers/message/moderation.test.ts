import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { moderationRouter } from "@@/server/trpc/routers/message/moderation";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { AdminActionType, bans, DatabaseEntityType, RoomPermission, rooms, usersToRooms } from "@esposter/db-schema";
import { NotFoundError, takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("moderation", () => {
  let mockContext: Context;
  let moderationCaller: DecorateRouterRecord<TRPCRouter["moderation"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  const durationMs = 1;
  const name = "name";

  const createMember = async () => {
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await roomCaller.createMembers({ roomId, userIds: [user.id] });
    return user;
  };

  const setupMemberWithRole = async (permissions: bigint, position: number) => {
    const member = await createMember();
    const role = await roleCaller.createRole({ name: crypto.randomUUID(), permissions, position, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: member.id });
    return { member, role };
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    moderationCaller = createCallerFactory(moderationRouter)(mockContext);
    roleCaller = createCallerFactory(roleRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockContext.db.delete(rooms);
  });

  describe("executeAdminAction", () => {
    test(`${AdminActionType.CreateBan}: owner bans member — ban row inserted, usersToRooms rows deleted`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.CreateBan,
      });

      const banRows = await mockContext.db
        .select()
        .from(bans)
        .where(and(eq(bans.roomId, roomId), eq(bans.userId, member.id)));
      const membershipRows = await mockContext.db
        .select()
        .from(usersToRooms)
        .where(and(eq(usersToRooms.roomId, roomId), eq(usersToRooms.userId, member.id)));

      expect(banRows).toHaveLength(1);
      expect(takeOne(banRows).userId).toBe(member.id);
      expect(membershipRows).toHaveLength(0);
    });

    test(`${AdminActionType.KickFromRoom}: owner kicks member — usersToRooms row deleted`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.KickFromRoom,
      });
      const membershipRows = await mockContext.db
        .select()
        .from(usersToRooms)
        .where(and(eq(usersToRooms.roomId, roomId), eq(usersToRooms.userId, member.id)));

      expect(membershipRows).toHaveLength(0);
    });

    test(`${AdminActionType.TimeoutUser}: owner times out member — timeoutUntil equals now plus durationMs`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        durationMs,
        roomId,
        targetUserId: member.id,
        type: AdminActionType.TimeoutUser,
      });

      const membershipRows = await mockContext.db
        .select()
        .from(usersToRooms)
        .where(and(eq(usersToRooms.roomId, roomId), eq(usersToRooms.userId, member.id)));

      expect(membershipRows).toHaveLength(1);

      const { timeoutUntil } = takeOne(membershipRows);
      assert(timeoutUntil !== null);

      expect(timeoutUntil.getTime()).toBe(durationMs);
    });

    test(`${AdminActionType.ForceMute}: owner mutes member — succeeds with no error`, async () => {
      expect.hasAssertions();

      const member = await createMember();

      await expect(
        moderationCaller.executeAdminAction({
          roomId,
          targetUserId: member.id,
          type: AdminActionType.ForceMute,
        }),
      ).resolves.toBeUndefined();
    });

    test(`${AdminActionType.ForceUnmute}: owner unmutes member — succeeds with no error`, async () => {
      expect.hasAssertions();

      const member = await createMember();

      await expect(
        moderationCaller.executeAdminAction({
          roomId,
          targetUserId: member.id,
          type: AdminActionType.ForceUnmute,
        }),
      ).resolves.toBeUndefined();
    });

    test(`${AdminActionType.KickFromVoice}: owner kicks member from voice — succeeds with no error`, async () => {
      expect.hasAssertions();

      const member = await createMember();

      await expect(
        moderationCaller.executeAdminAction({
          roomId,
          targetUserId: member.id,
          type: AdminActionType.KickFromVoice,
        }),
      ).resolves.toBeUndefined();
    });

    test(`member without ${RoomPermission.BanMembers} permission cannot ban — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const target = await createMember();
      const { member: actor } = await setupMemberWithRole(RoomPermission.KickMembers, 5);
      await mockSessionOnce(mockContext.db, actor);

      await expect(
        moderationCaller.executeAdminAction({
          roomId,
          targetUserId: target.id,
          type: AdminActionType.CreateBan,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    });

    test("isManageable: member cannot ban another member at equal position — throws UNAUTHORIZED", async () => {
      expect.hasAssertions();

      const { member: actor } = await setupMemberWithRole(RoomPermission.BanMembers, 5);
      const { member: target } = await setupMemberWithRole(0n, 5);
      await mockSessionOnce(mockContext.db, actor);

      await expect(
        moderationCaller.executeAdminAction({
          roomId,
          targetUserId: target.id,
          type: AdminActionType.CreateBan,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    });
  });

  describe("readBans", () => {
    test("owner reads empty ban list after room creation", async () => {
      expect.hasAssertions();

      const result = await moderationCaller.readBans({ limit: 15, roomId });

      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeUndefined();
    });

    test("after banning a user, readBans returns that user in results", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.CreateBan,
      });

      const result = await moderationCaller.readBans({ limit: 15, roomId });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).userId).toBe(member.id);
    });

    test(`member without ${RoomPermission.BanMembers} permission cannot readBans — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(moderationCaller.readBans({ limit: 15, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: UNAUTHORIZED]`,
      );
    });
  });

  describe("readModerationLog", () => {
    test(`member without ${RoomPermission.ManageRoom} permission cannot readModerationLog — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(
        moderationCaller.readModerationLog({ limit: 15, roomId }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    });
  });

  describe("deleteBan", () => {
    test("owner deletes a ban for a previously banned user — ban record deleted, readBans returns empty", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.CreateBan,
      });
      await moderationCaller.deleteBan({ roomId, userId: member.id });

      const result = await moderationCaller.readBans({ limit: 15, roomId });

      expect(result.items).toHaveLength(0);
    });

    test("delete ban with non-existent userId — throws NOT_FOUND", async () => {
      expect.hasAssertions();

      const nonExistentUserId = crypto.randomUUID();

      await expect(
        moderationCaller.deleteBan({ roomId, userId: nonExistentUserId }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new NotFoundError(DatabaseEntityType.Ban, nonExistentUserId).message}]`,
      );
    });

    test(`member without ${RoomPermission.BanMembers} permission cannot delete ban — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(
        moderationCaller.deleteBan({ roomId, userId: crypto.randomUUID() }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    });
  });

  describe("onAdminAction", () => {
    test("targeted user receives the emitted action", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);
      const onAdminAction = await moderationCaller.onAdminAction({ roomId });

      const data = await withAsyncIterator(
        () => onAdminAction,
        async (iterator) => {
          const [result] = await Promise.all([
            iterator.next(),
            moderationCaller.executeAdminAction({
              roomId,
              targetUserId: member.id,
              type: AdminActionType.KickFromVoice,
            }),
          ]);
          return result;
        },
      );

      assert(!data.done);

      expect(data.value.type).toBe(AdminActionType.KickFromVoice);
      expect(data.value.durationMs).toBeUndefined();
    });
  });
});
