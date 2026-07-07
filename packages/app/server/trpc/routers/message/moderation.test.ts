import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient.test";
import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { moderationRouter } from "@@/server/trpc/routers/message/moderation";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import {
  AdminActionType,
  AzureTable,
  bansInMessage,
  RoomPermission,
  StandardMessageEntity,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("moderation", () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let moderationCaller: DecorateRouterRecord<TRPCRouter["message"]["moderation"]>;
  let roomId: string;
  const durationMs = 1;

  beforeAll(() => {
    mockContext = getMockContext();
    moderationCaller = createCallerFactory(moderationRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "setImmediate", "clearImmediate"],
    });
    vi.setSystemTime(0);
    roomId = getRoomId();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("executeAdminAction", () => {
    test(`${AdminActionType.CreateBan}: owner bansInMessage member — ban row inserted, usersToRoomsInMessage rows deleted`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.CreateBan,
      });

      const banRows = await mockContext.db
        .select()
        .from(bansInMessage)
        .where(and(eq(bansInMessage.roomId, roomId), eq(bansInMessage.userId, member.id)));
      const membershipRows = await mockContext.db
        .select()
        .from(usersToRoomsInMessage)
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, member.id)));

      expect(banRows).toHaveLength(1);
      expect(takeOne(banRows).userId).toBe(member.id);
      expect(membershipRows).toHaveLength(0);
    });

    test(`${AdminActionType.KickFromRoom}: owner kicks member — usersToRoomsInMessage row deleted`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.KickFromRoom,
      });
      const membershipRows = await mockContext.db
        .select()
        .from(usersToRoomsInMessage)
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, member.id)));

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
        .from(usersToRoomsInMessage)
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, member.id)));

      expect(membershipRows).toHaveLength(1);

      const { timeoutUntil } = takeOne(membershipRows);
      assert(timeoutUntil !== null);

      expect(timeoutUntil.getTime()).toBe(durationMs);
    });

    test(`${AdminActionType.ForceMute}: owner mutes member — succeeds with no error`, async () => {
      expect.hasAssertions();

      const member = await createMember();

      const result = await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.ForceMute,
      });

      expect(result).toBeUndefined();
    });

    test(`${AdminActionType.ForceUnmute}: owner unmutes member — succeeds with no error`, async () => {
      expect.hasAssertions();

      const member = await createMember();

      const result = await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.ForceUnmute,
      });

      expect(result).toBeUndefined();
    });

    test(`${AdminActionType.KickFromCall}: owner kicks member from the call — succeeds with no error`, async () => {
      expect.hasAssertions();

      const member = await createMember();

      const result = await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.KickFromCall,
      });

      expect(result).toBeUndefined();
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

    test(`${AdminActionType.SoftBan}: owner soft-bans member — ban row inserted, usersToRoomsInMessage row deleted`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.SoftBan,
      });
      const banRows = await mockContext.db
        .select()
        .from(bansInMessage)
        .where(and(eq(bansInMessage.roomId, roomId), eq(bansInMessage.userId, member.id)));
      const membershipRows = await mockContext.db
        .select()
        .from(usersToRoomsInMessage)
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, member.id)));

      expect(banRows).toHaveLength(1);
      expect(takeOne(banRows).userId).toBe(member.id);
      expect(membershipRows).toHaveLength(0);
    });

    test(`${AdminActionType.SoftBan}: soft-deletes all messages`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.SoftBan,
      });

      const messagesClient = await useTableClient(AzureTable.Messages);
      const memberMessages: StandardMessageEntity[] = [];
      for await (const page of messagesClient.listEntities<StandardMessageEntity>().byPage())
        memberMessages.push(...page);

      expect(memberMessages).toHaveLength(1);
      expect(memberMessages.every(({ deletedAt }) => deletedAt)).toBe(true);
    });
  });

  describe("readBans", () => {
    test("owner reads empty ban list after room creation", async () => {
      expect.hasAssertions();

      const result = await moderationCaller.readBans({ roomId });

      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBe("");
    });

    test("after banning a user, readBans returns that user in results", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.CreateBan,
      });

      const result = await moderationCaller.readBans({ roomId });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).userId).toBe(member.id);
    });

    test(`member without ${RoomPermission.BanMembers} permission cannot readBans — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(moderationCaller.readBans({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: UNAUTHORIZED]`,
      );
    });
  });

  describe("readModerationLog", () => {
    test(`member without ${RoomPermission.ManageRoom} permission cannot readModerationLog — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(moderationCaller.readModerationLog({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: UNAUTHORIZED]`,
      );
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

      const result = await moderationCaller.readBans({ roomId });

      expect(result.items).toHaveLength(0);
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

      const data = await getFirstEmit(
        () => onAdminAction,
        () =>
          moderationCaller.executeAdminAction({
            roomId,
            targetUserId: member.id,
            type: AdminActionType.KickFromCall,
          }),
      );

      expect(data.type).toBe(AdminActionType.KickFromCall);
      expect(data.durationMs).toBeUndefined();
    });
  });
});
