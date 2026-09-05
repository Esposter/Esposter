import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createCallerFactory } from "@@/server/trpc";
import { getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { moderationRouter } from "@@/server/trpc/routers/message/moderation";
import { createDirectMessageWithFriend } from "@@/server/trpc/routers/room/createDirectMessageWithFriend.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import {
  AdminActionType,
  AzureTable,
  bansInMessage,
  DatabaseEntityType,
  RoomPermission,
  StandardMessageEntity,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("moderation", () => {
  const { createMember, getMockContext, getRoomCaller, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let moderationCaller: DecorateRouterRecord<TRPCRouter["message"]["moderation"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
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
    roomCaller = getRoomCaller();
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

    // A ban that only deletes the membership row is undone by the link the member still holds. The rejection
    // Names the condition rather than being a bare UNAUTHORIZED, because it is one the caller can act on —
    // Retrying the link is the one thing that will never work
    test(`${AdminActionType.CreateBan}: a banned member cannot rejoin through an invite`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.CreateBan,
      });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
      await mockSessionOnce(mockContext.db, member);

      await expect(roomCaller.joinRoom(invite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: You are banned from this room]`,
      );
    });

    // Owner immunity is not a position comparison: the owner holds no role row, so every assigned role outranks
    // Their floor position and a moderator would be able to ban the member who owns the room
    test(`${AdminActionType.CreateBan}: moderator cannot ban the room owner`, async () => {
      expect.hasAssertions();

      const ownerId = getMockSession().user.id;
      const { member } = await setupMemberWithRole(RoomPermission.BanMembers, position);
      await mockSessionOnce(mockContext.db, member);

      await expect(
        moderationCaller.executeAdminAction({ roomId, targetUserId: ownerId, type: AdminActionType.CreateBan }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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

    // A moderation kick is still a departure, so it owes the room what a leave does — without the event every
    // Other member's list keeps a member the room no longer has
    test(`${AdminActionType.KickFromRoom}: announces the removal`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      const onLeaveRoom = await roomCaller.onLeaveRoom([roomId]);
      const leaveRoom = await getFirstEmit(
        () => onLeaveRoom,
        () =>
          moderationCaller.executeAdminAction({
            roomId,
            targetUserId: member.id,
            type: AdminActionType.KickFromRoom,
          }),
      );
      const messagesClient = await useTableClient(AzureTable.Messages);
      const messages = await Array.fromAsync(messagesClient.listEntities<StandardMessageEntity>());

      expect(leaveRoom).toStrictEqual({ roomId, userId: member.id });
      expect(messages.map(({ message }) => message)).toContain(`${member.name} was kicked from the room.`);
    });

    // Moderating yourself is not a hierarchy question, and the comparison cannot answer it — an owner outranks
    // Themselves under every rule it knows
    test("rejects an action aimed at the actor", async () => {
      expect.hasAssertions();

      const targetUserId = getMockSession().user.id;
      const input = { roomId, targetUserId };

      await expect(
        moderationCaller.executeAdminAction({ ...input, type: AdminActionType.KickFromRoom }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.UserToRoom, JSON.stringify(input)).message}]`,
      );
    });

    // A direct message has no roles and no moderators — its pair block each other instead
    test("rejects an action aimed at a direct message", async () => {
      expect.hasAssertions();

      const { directMessage, user } = await createDirectMessageWithFriend(mockContext);

      await expect(
        moderationCaller.executeAdminAction({
          roomId: directMessage.id,
          targetUserId: user.id,
          type: AdminActionType.KickFromRoom,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, directMessage.id).message}]`,
      );
    });

    // These three land on the call pipeline rather than the database, so the mutation itself only has to record
    // The action and resolve. `as const` keeps the rows as their own literals — a plain array widens to
    // `AdminActionType`, which the discriminated input union rejects
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
      // The room's own lines are not the member's — their join and the ban that removed them both stay, so the
      // Purge is asserted against what the member wrote
      const memberMessages = (await Array.fromAsync(messagesClient.listEntities<StandardMessageEntity>())).filter(
        ({ userId }) => userId === member.id,
      );

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

    // The panel paginates every ban a room has ever placed, so without a predicate finding one person means
    // Scrolling all of them. The name is the room's, not the ban's — the join that renders the row provides it
    test("filters bans by the banned user's name", async () => {
      expect.hasAssertions();

      const bannedUserNames = ["searched", "other"];
      for (const bannedUserName of bannedUserNames) {
        const member = await createMember();
        await mockContext.db.update(users).set({ name: bannedUserName }).where(eq(users.id, member.id));
        await moderationCaller.executeAdminAction({
          roomId,
          targetUserId: member.id,
          type: AdminActionType.CreateBan,
        });
      }

      const result = await moderationCaller.readBans({ filter: { name: "search" }, roomId });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).user.name).toBe("searched");
    });

    // A name is user input, so the wildcards have to mean themselves — otherwise searching for a literal
    // Underscore matches every single-character name in the room
    test("searches a wildcard in a name as itself", async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockContext.db.update(users).set({ name: "ab" }).where(eq(users.id, member.id));
      await moderationCaller.executeAdminAction({
        roomId,
        targetUserId: member.id,
        type: AdminActionType.CreateBan,
      });

      const result = await moderationCaller.readBans({ filter: { name: "a_" }, roomId });

      expect(result.items).toHaveLength(0);
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

      // Sequential: `createMember` replaces the room's invite for its caller and consumes a one-shot session,
      // So the two cannot overlap
      const firstMember = await createMember();
      const secondMember = await createMember();
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

      // Sequential: `createMember` replaces the room's invite for its caller and consumes a one-shot session,
      // So the two cannot overlap
      const firstMember = await createMember();
      const secondMember = await createMember();
      await moderationCaller.createModerationNote({ note, roomId, targetUserId: firstMember.id });
      vi.setSystemTime(durationMs);
      await moderationCaller.createModerationNote({ note, roomId, targetUserId: secondMember.id });

      const result = await moderationCaller.readModerationNotes({ roomId, targetUserId: secondMember.id });

      expect(result.items).toHaveLength(1);
      expect(takeOne(result.items).targetUserId).toBe(secondMember.id);
    });
  });

  describe("readModerationNotesCount", () => {
    test("counts all of the target member's notes regardless of page size", async () => {
      expect.hasAssertions();

      const member = await createMember();
      const noteCount = 3;
      for (let i = 0; i < noteCount; i++) {
        vi.setSystemTime(i);
        await moderationCaller.createModerationNote({ note, roomId, targetUserId: member.id });
      }

      const firstPage = await moderationCaller.readModerationNotes({ limit: 1, roomId, targetUserId: member.id });
      const count = await moderationCaller.readModerationNotesCount({ roomId, targetUserId: member.id });

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

  // Every procedure here is permission-gated and a plain member holds none of them
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

    // A separate target, because moderating yourself is rejected before any permission is read
    const target = await createMember();
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);

    await expect(moderate(target.id)).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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
