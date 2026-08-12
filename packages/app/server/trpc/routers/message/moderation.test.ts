import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createCallerFactory } from "@@/server/trpc";
import { getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { moderationRouter } from "@@/server/trpc/routers/message/moderation";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import {
  AdminActionType,
  AzureTable,
  bansInMessage,
  DatabaseEntityType,
  RoomPermission,
  StandardMessageEntity,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("moderation", () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let moderationCaller: DecorateRouterRecord<TRPCRouter["message"]["moderation"]>;
  let roomId: string;
  const durationMs = 1;
  const note = "note";
  const position = 5;
  const emptyFilters = { actorUserId: "", targetUserId: "", type: "" } as const;
  const readBanRows = (userId: string) =>
    mockContext.db
      .select()
      .from(bansInMessage)
      .where(and(eq(bansInMessage.roomId, roomId), eq(bansInMessage.userId, userId)));
  const readMembershipRows = (userId: string) =>
    mockContext.db
      .select()
      .from(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)));

  beforeAll(() => {
    mockContext = getMockContext();
    moderationCaller = createCallerFactory(moderationRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({
      now: 0,
      toFake: ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "setImmediate", "clearImmediate"],
    });
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

      const banRows = await readBanRows(member.id);
      const membershipRows = await readMembershipRows(member.id);

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
      const membershipRows = await readMembershipRows(member.id);

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

      const membershipRows = await readMembershipRows(member.id);

      expect(membershipRows).toHaveLength(1);

      const { timeoutUntil } = takeOne(membershipRows);
      assert(timeoutUntil !== null);

      expect(timeoutUntil.getTime()).toBe(durationMs);
    });

    // These three land on the call pipeline rather than the database, so the mutation itself only has to record
    // The action and resolve
    // `as const` keeps the rows as their own literals — a plain array widens to `AdminActionType`, which the
    // Discriminated input union rejects
    test.each([AdminActionType.ForceMute, AdminActionType.ForceUnmute, AdminActionType.KickFromCall] as const)(
      "%s: owner applies it to a member — succeeds with no error",
      async (type) => {
        expect.hasAssertions();

        const member = await createMember();

        await expect(
          moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type }),
        ).resolves.toBeUndefined();
      },
    );

    test(`${AdminActionType.SoftBan}: owner soft-bans member — ban row inserted, usersToRoomsInMessage row deleted`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.SoftBan,
      });
      const banRows = await readBanRows(member.id);
      const membershipRows = await readMembershipRows(member.id);

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
      const memberMessages = await Array.fromAsync(messagesClient.listEntities<StandardMessageEntity>());

      expect(memberMessages).toHaveLength(1);
      expect(memberMessages.every(({ deletedAt }) => deletedAt)).toBe(true);
    });
  });

  describe("readBans", () => {
    test("owner reads empty ban list after room creation", async () => {
      expect.hasAssertions();

      const result = await moderationCaller.readBans({ roomId });

      expect(result.items).toHaveLength(0);
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
  });

  describe("readModerationLog", () => {
    test("filters by type", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceMute });
      vi.setSystemTime(durationMs);
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.ForceUnmute,
      });

      const result = await moderationCaller.readModerationLog({
        ...emptyFilters,
        roomId,
        type: AdminActionType.ForceUnmute,
      });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).type).toBe(AdminActionType.ForceUnmute);
    });

    test("filters by targetUserId", async () => {
      expect.hasAssertions();

      const [firstMember, secondMember] = await Promise.all([createMember(), createMember()]);
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: firstMember.id,
        type: AdminActionType.ForceMute,
      });
      vi.setSystemTime(durationMs);
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: secondMember.id,
        type: AdminActionType.ForceMute,
      });

      const result = await moderationCaller.readModerationLog({
        ...emptyFilters,
        roomId,
        targetUserId: secondMember.id,
      });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).targetUserId).toBe(secondMember.id);
    });

    test("filters by actorUserId — non-actor matches nothing", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceMute });

      const result = await moderationCaller.readModerationLog({ ...emptyFilters, actorUserId: member.id, roomId });

      expect(result.items).toHaveLength(0);
    });

    test("filters by actorUserId — actor matches their own actions", async () => {
      expect.hasAssertions();

      const owner = getMockSession().user;
      const member = await createMember();
      await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceMute });

      const result = await moderationCaller.readModerationLog({ ...emptyFilters, actorUserId: owner.id, roomId });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).actorUserId).toBe(owner.id);
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

    test("owner deletes a ban that was never created — the delete itself reports nothing was removed", async () => {
      expect.hasAssertions();

      const member = await createMember();

      await expect(
        moderationCaller.deleteBan({ roomId, userId: member.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Ban, member.id).message}]`,
      );
    });
  });

  describe("createModerationNote", () => {
    test("owner creates a note — readModerationNotes returns it", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.createModerationNote({ note, roomId, targetUserId: member.id });

      const result = await moderationCaller.readModerationNotes({ roomId, targetUserId: member.id });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).note).toBe(note);
      expect(takeOne(result.items).targetUserId).toBe(member.id);
    });
  });

  describe("readModerationNotes", () => {
    test("returns only the target member's notes", async () => {
      expect.hasAssertions();

      const [firstMember, secondMember] = await Promise.all([createMember(), createMember()]);
      await moderationCaller.createModerationNote({ note, roomId, targetUserId: firstMember.id });
      vi.setSystemTime(durationMs);
      await moderationCaller.createModerationNote({ note, roomId, targetUserId: secondMember.id });

      const result = await moderationCaller.readModerationNotes({ roomId, targetUserId: secondMember.id });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).targetUserId).toBe(secondMember.id);
    });
  });

  describe("countModerationNotes", () => {
    test("counts all of the target member's notes regardless of page size", async () => {
      expect.hasAssertions();

      const member = await createMember();
      const noteCount = 3;
      for (let i = 0; i < noteCount; i++) {
        vi.setSystemTime(i);
        await moderationCaller.createModerationNote({ note, roomId, targetUserId: member.id });
      }

      const firstPage = await moderationCaller.readModerationNotes({ limit: 1, roomId, targetUserId: member.id });
      const count = await moderationCaller.countModerationNotes({ roomId, targetUserId: member.id });

      expect(firstPage.items).toHaveLength(1);
      expect(count).toBe(noteCount);
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

  // Every procedure here is permission-gated and a plain member holds none of them. The guard is one guard, so
  // What earns a line is that each procedure is actually behind it — not how any one of them refuses
  test.each([
    [RoomPermission.BanMembers, "readBans", () => moderationCaller.readBans({ roomId })],
    [
      RoomPermission.BanMembers,
      "executeAdminAction",
      (targetUserId: string) =>
        moderationCaller.executeAdminAction({ roomId, targetUserId, type: AdminActionType.CreateBan }),
    ],
    [
      RoomPermission.BanMembers,
      "deleteBan",
      (targetUserId: string) => moderationCaller.deleteBan({ roomId, userId: targetUserId }),
    ],
    [
      RoomPermission.ManageRoom,
      "readModerationLog",
      () => moderationCaller.readModerationLog({ ...emptyFilters, roomId }),
    ],
    [
      RoomPermission.KickMembers,
      "createModerationNote",
      (targetUserId: string) => moderationCaller.createModerationNote({ note, roomId, targetUserId }),
    ],
    [
      RoomPermission.KickMembers,
      "readModerationNotes",
      (targetUserId: string) => moderationCaller.readModerationNotes({ roomId, targetUserId }),
    ],
  ])("member without %s permission cannot %s — throws UNAUTHORIZED", async (_permission, _procedureName, moderate) => {
    expect.hasAssertions();

    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);

    await expect(moderate(member.id)).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  // Holding the permission is not enough: the target has to sit below the actor, and equal is not below. Each row
  // Reaches `isManageable` down a different procedure's path, which is the part that is not shared
  test.each([
    [
      RoomPermission.BanMembers,
      "executeAdminAction",
      (targetUserId: string) =>
        moderationCaller.executeAdminAction({ roomId, targetUserId, type: AdminActionType.CreateBan }),
    ],
    [
      RoomPermission.KickMembers,
      "createModerationNote",
      (targetUserId: string) => moderationCaller.createModerationNote({ note, roomId, targetUserId }),
    ],
    [
      RoomPermission.KickMembers,
      "readModerationNotes",
      (targetUserId: string) => moderationCaller.readModerationNotes({ roomId, targetUserId }),
    ],
  ])(
    "isManageable: %s cannot %s against a member at equal position — throws UNAUTHORIZED",
    async (permission, _procedureName, moderate) => {
      expect.hasAssertions();

      const { member: actor } = await setupMemberWithRole(permission, position);
      const { member: target } = await setupMemberWithRole(0n, position);
      await mockSessionOnce(mockContext.db, actor);

      await expect(moderate(target.id)).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    },
  );
});
