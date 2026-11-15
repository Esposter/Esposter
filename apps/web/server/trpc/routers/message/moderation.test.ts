/* oxlint-disable no-await-in-loop -- Each step reads the last: each member's join replaces the room's invite (createRoomMember); Each step reads the last: each note takes the clock set just before it */
import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { RoomObjectRpc } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { createCallSessionId } from "#server/services/message/call/createCallSessionId";
import { DELETE_USER_MESSAGES_PAGE_LIMIT } from "#server/services/message/constants";
import { createRoomMessage } from "#server/services/message/createRoomMessage.test";
import { createCallerFactory } from "#server/trpc";
import { createMockAuthSession, createMockCaller, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createMentionMessage } from "#server/trpc/routers/createMentionMessage.test";
import { inviteRouter } from "#server/trpc/routers/invite";
import { moderationRouter } from "#server/trpc/routers/message/moderation";
import { readRoomMembershipRows } from "#server/trpc/routers/readRoomMembershipRows.test";
import { roomRouter } from "#server/trpc/routers/room";
import { createDirectMessageWithFriend } from "#server/trpc/routers/room/createDirectMessageWithFriend.test";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import {
  AdminActionType,
  bansInMessage,
  DatabaseEntityType,
  MessageType,
  RoomPermission,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#server/composables/realtime/useCallObject"), () => ({ useCallObject: vi.fn<typeof useCallObject>() }));
// The room's object writes the system lines and purges a soft-banned member's messages, so it is faked: each method
// Answers what a test sets, and what the router sent it is what the tests read
const { roomObject } = vi.hoisted(() => ({
  roomObject: {
    broadcastEvent: vi.fn<RoomObjectRpc["broadcastEvent"]>(),
    createMessage: vi.fn<RoomObjectRpc["createMessage"]>(),
    deleteUserMessages: vi.fn<RoomObjectRpc["deleteUserMessages"]>(),
    notifyOnlineMembers: vi.fn<RoomObjectRpc["notifyOnlineMembers"]>(),
    removeMember: vi.fn<RoomObjectRpc["removeMember"]>(),
  },
}));
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: () => roomObject as unknown as ReturnType<typeof useRoomObject>,
}));

type ModerationCaller = DecorateRouterRecord<TRPCRouter["message"]["moderation"]>;

describe("moderationRouter", () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let moderationCaller: ModerationCaller;
  let inviteCaller: DecorateRouterRecord<TRPCRouter["invite"]>;
  let roomId: string;
  const durationMs = 1;
  const note = "note";
  const position = 1;
  const emptyFilters = { actorUserId: "", targetUserId: "", type: "" } as const;
  const readBanRows = (userId: string) =>
    mockContext.db
      .select()
      .from(bansInMessage)
      .where(and(eq(bansInMessage.roomId, roomId), eq(bansInMessage.userId, userId)));
  const readMembershipRows = (userId: string) => readRoomMembershipRows(mockContext.db, roomId, userId);

  beforeAll(() => {
    mockContext = getMockContext();
    moderationCaller = createCallerFactory(moderationRouter)(mockContext);
    inviteCaller = createCallerFactory(inviteRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({
      now: 0,
      toFake: ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "setImmediate", "clearImmediate"],
    });
    roomObject.deleteUserMessages.mockResolvedValue([]);
    roomId = getRoomId();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([AdminActionType.CreateBan, AdminActionType.SoftBan] as const)(
    "executeAdminAction %s inserts the ban row and deletes the membership rows",
    async (type) => {
      expect.hasAssertions();

      const member = await createMember();
      await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type });

      const banRows = await readBanRows(member.id);
      const membershipRows = await readMembershipRows(member.id);

      expect(banRows).toHaveLength(1);
      expect(takeOne(banRows).userId).toBe(member.id);
      expect(membershipRows).toHaveLength(0);
    },
  );

  // A ban that only deletes the membership row is undone by the link the member still holds. The rejection
  // Names the condition rather than being a bare UNAUTHORIZED, because it is one the caller can act on —
  // Retrying the link is the one thing that will never work
  test(`executeAdminAction ${AdminActionType.CreateBan} answers the member's join through an invite like an unknown link`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.CreateBan });
    const invite = await inviteCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
    const memberAuthSession = await createMockAuthSession(mockContext.db, member);
    const memberRoomCaller = createCallerFactory(roomRouter)(await createMockContext(memberAuthSession));

    await expect(memberRoomCaller.joinRoom(invite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, invite.id).message}]`,
    );
  });

  // Owner immunity is not a position comparison: the owner holds no role row, so every assigned role outranks
  // Their floor position and a moderator would be able to ban the member who owns the room
  test(`fails executeAdminAction ${AdminActionType.CreateBan} against the room owner`, async () => {
    expect.hasAssertions();

    const ownerId = getMockSession().user.id;
    const { member } = await setupMemberWithRole(RoomPermission.BanMembers, position);
    const memberCaller = await createMockCaller(moderationRouter, await createMockAuthSession(mockContext.db, member));

    await expect(
      memberCaller.executeAdminAction({ roomId, targetUserId: ownerId, type: AdminActionType.CreateBan }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test(`executeAdminAction ${AdminActionType.KickFromRoom} deletes the membership row`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.KickFromRoom });
    const membershipRows = await readMembershipRows(member.id);

    expect(membershipRows).toHaveLength(0);
  });

  test(`executeAdminAction ${AdminActionType.TimeoutUser} sets timeoutUntil to now plus the duration`, async () => {
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

  // A moderation kick is still a departure, so it owes the room the line saying who went, written as the moderator.
  // The join that made the member is also a line the room was sent, so the kick's own line is the last one
  test(`executeAdminAction ${AdminActionType.KickFromRoom} announces the removal in the room`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.KickFromRoom });

    expect(roomObject.createMessage).toHaveBeenLastCalledWith(
      { message: `${member.name} was kicked from the room.`, type: MessageType.System },
      { userId: getMockSession().user.id },
    );
  });

  // Moderating yourself is not a hierarchy question, and the comparison cannot answer it — an owner outranks
  // Themselves under every rule it knows
  test("fails executeAdminAction aimed at the actor", async () => {
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
  test("fails executeAdminAction aimed at a direct message", async () => {
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

  // The purge reads the member's messages a page at a time, so a page that comes back full is followed by the next one
  test(`executeAdminAction ${AdminActionType.SoftBan} purges the member's messages in their room, page by page`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    const lastMessageId = 7;
    const firstPage = Array.from({ length: DELETE_USER_MESSAGES_PAGE_LIMIT }, (_value, index) =>
      createRoomMessage({ id: index + 1, userId: member.id }),
    );
    roomObject.deleteUserMessages
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce([createRoomMessage({ id: lastMessageId, userId: member.id })]);
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.SoftBan });

    expect(roomObject.deleteUserMessages).toHaveBeenNthCalledWith(1, {
      limit: DELETE_USER_MESSAGES_PAGE_LIMIT,
      userId: member.id,
    });
    expect(roomObject.deleteUserMessages).toHaveBeenNthCalledWith(2, {
      after: DELETE_USER_MESSAGES_PAGE_LIMIT,
      limit: DELETE_USER_MESSAGES_PAGE_LIMIT,
      userId: member.id,
    });
  });

  // A purged message's mention counts are taken back with it, as a delete takes them back, so the member it named is not left
  // Holding a badge for a message that no longer reads
  test(`executeAdminAction ${AdminActionType.SoftBan} takes back the mention counts its purged messages made`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    const mentionedMember = await createMember();
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ createdAt: new Date(0), mentionCount: 1 })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, mentionedMember.id)));
    roomObject.deleteUserMessages.mockResolvedValueOnce([
      createRoomMessage({ message: createMentionMessage(mentionedMember.id), userId: member.id }),
    ]);
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.SoftBan });

    const mentionedRoomRow = await mockContext.db.query.usersToRoomsInMessage.findFirst({
      columns: { mentionCount: true },
      where: { roomId: { eq: roomId }, userId: { eq: mentionedMember.id } },
    });

    expect(mentionedRoomRow).toStrictEqual({ mentionCount: 0 });
  });

  test("readBans returns the banned user", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.CreateBan });

    const result = await moderationCaller.readBans({ roomId });

    expect(result.items).toHaveLength(1);
    expect(takeOne(result.items).userId).toBe(member.id);
    // A banned member has left the room, so their name is the account name
    expect(takeOne(result.items).user.displayName).toBe(member.name);
  });

  // The panel paginates every ban a room has ever placed, so without a predicate finding one person means
  // Scrolling all of them. The name is the room's, not the ban's — the join that renders the row provides it
  test("readBans filters by the banned user's name", async () => {
    expect.hasAssertions();

    const searchedName = "a";
    for (const bannedUserName of [searchedName, "b"]) {
      const member = await createMember();
      await mockContext.db.update(usersInAuth).set({ name: bannedUserName }).where(eq(usersInAuth.id, member.id));
      await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.CreateBan });
    }

    const result = await moderationCaller.readBans({ filter: { name: searchedName }, roomId });

    expect(result.items).toHaveLength(1);
    expect(takeOne(result.items).user.name).toBe(searchedName);
  });

  // A name is user input, so the wildcards have to mean themselves — otherwise searching for a literal
  // Underscore matches every single-character name in the room
  test("readBans searches a wildcard in a name as itself", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await mockContext.db.update(usersInAuth).set({ name: "ab" }).where(eq(usersInAuth.id, member.id));
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.CreateBan });

    const result = await moderationCaller.readBans({ filter: { name: "a_" }, roomId });

    expect(result.items).toHaveLength(0);
  });

  test("readModerationLog filters by type", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceMute });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(durationMs));
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceUnmute });

    const result = await moderationCaller.readModerationLog({
      ...emptyFilters,
      roomId,
      type: AdminActionType.ForceUnmute,
    });

    expect(result.items).toHaveLength(1);
    expect(takeOne(result.items).type).toBe(AdminActionType.ForceUnmute);
  });

  test("readModerationLog filters by targetUserId", async () => {
    expect.hasAssertions();

    // Sequential: `createMember` replaces the room's invite for its caller,
    // So the two cannot overlap
    const firstMember = await createMember();
    const secondMember = await createMember();
    await moderationCaller.executeAdminAction({
      roomId,
      targetUserId: firstMember.id,
      type: AdminActionType.ForceMute,
    });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(durationMs));
    await moderationCaller.executeAdminAction({
      roomId,
      targetUserId: secondMember.id,
      type: AdminActionType.ForceMute,
    });

    const result = await moderationCaller.readModerationLog({ ...emptyFilters, roomId, targetUserId: secondMember.id });

    expect(result.items).toHaveLength(1);
    expect(takeOne(result.items).targetUserId).toBe(secondMember.id);
  });

  test("readModerationLog filters by actorUserId — a non-actor matches nothing", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceMute });

    const result = await moderationCaller.readModerationLog({ ...emptyFilters, actorUserId: member.id, roomId });

    expect(result.items).toHaveLength(0);
  });

  test("readModerationLog filters by actorUserId — the actor matches their own actions", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceMute });

    const result = await moderationCaller.readModerationLog({ ...emptyFilters, actorUserId: owner.id, roomId });

    expect(result.items).toHaveLength(1);
    expect(takeOne(result.items).actorUserId).toBe(owner.id);
  });

  test("deleteBan removes the ban row", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.CreateBan });
    await moderationCaller.deleteBan({ roomId, userId: member.id });

    const result = await moderationCaller.readBans({ roomId });

    expect(result.items).toHaveLength(0);
  });

  test("fails deleteBan when no ban was ever created", async () => {
    expect.hasAssertions();

    const member = await createMember();

    await expect(moderationCaller.deleteBan({ roomId, userId: member.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Ban, member.id).message}]`,
    );
  });

  test("createModerationNote stores a note readModerationNotes returns", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.createModerationNote({ note, roomId, targetUserId: member.id });

    const result = await moderationCaller.readModerationNotes({ roomId, targetUserId: member.id });
    const moderationNote = takeOne(result.items);

    expect(result.items).toHaveLength(1);
    expect(moderationNote.note).toBe(note);
    expect(moderationNote.targetUserId).toBe(member.id);
    expect(moderationNote.actorDisplayName).toBe(getMockSession().user.name);
  });

  test("readModerationLog names the actor and the target in the room", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.ForceMute });

    const result = await moderationCaller.readModerationLog({ ...emptyFilters, roomId });

    expect(takeOne(result.items).actorDisplayName).toBe(getMockSession().user.name);
    expect(takeOne(result.items).targetDisplayName).toBe(member.name);
  });

  test("readModerationNotes returns only the target member's notes", async () => {
    expect.hasAssertions();

    // Sequential: `createMember` replaces the room's invite for its caller,
    // So the two cannot overlap
    const firstMember = await createMember();
    const secondMember = await createMember();
    await moderationCaller.createModerationNote({ note, roomId, targetUserId: firstMember.id });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(durationMs));
    await moderationCaller.createModerationNote({ note, roomId, targetUserId: secondMember.id });

    const result = await moderationCaller.readModerationNotes({ roomId, targetUserId: secondMember.id });

    expect(result.items).toHaveLength(1);
    expect(takeOne(result.items).targetUserId).toBe(secondMember.id);
  });

  test("readModerationNotesCount counts every note regardless of page size", async () => {
    expect.hasAssertions();

    const member = await createMember();
    const noteCount = 2;
    for (let i = 0; i < noteCount; i++) {
      vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(i));
      await moderationCaller.createModerationNote({ note, roomId, targetUserId: member.id });
    }

    const firstPage = await moderationCaller.readModerationNotes({ limit: 1, roomId, targetUserId: member.id });
    const count = await moderationCaller.readModerationNotesCount({ roomId, targetUserId: member.id });

    expect(firstPage.items).toHaveLength(1);
    expect(count).toBe(noteCount);
  });

  // The targeted client leaving on its own is a courtesy, so the server takes the member out: one that ignored the
  // Action would otherwise stay connected to a call it was removed from
  test.each([
    AdminActionType.CreateBan,
    AdminActionType.KickFromCall,
    AdminActionType.KickFromRoom,
    AdminActionType.SoftBan,
  ] as const)("executeAdminAction %s takes the member out of the room's call", async (type) => {
    expect.hasAssertions();

    const member = await createMember();
    const callSessionId = await createCallSessionId(mockContext.db, roomId, member.id);
    const evictUser = vi.fn<(input: { callSessionId: string; userId: string }) => Promise<unknown[]>>(() =>
      Promise.resolve([]),
    );
    vi.mocked(useCallObject).mockReturnValueOnce({ evictUser } as unknown as ReturnType<typeof useCallObject>);
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type });

    expect(evictUser).toHaveBeenCalledExactlyOnceWith({ callSessionId, userId: member.id });
  });

  // The action reaches the targeted member's own sockets, tagged to them, and no other socket in the room
  test("broadcasts the action to the targeted user's sockets", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await moderationCaller.executeAdminAction({ roomId, targetUserId: member.id, type: AdminActionType.KickFromCall });

    expect(roomObject.broadcastEvent).toHaveBeenLastCalledWith(
      { data: { roomId, targetUserId: member.id, type: AdminActionType.KickFromCall }, type: "adminAction" },
      { tag: `user:${member.id}` },
    );
  });

  // Every procedure here is permission-gated and a plain member holds none of them
  test.each([
    [RoomPermission.BanMembers, "readBans", (caller: ModerationCaller) => caller.readBans({ roomId })],
    [
      RoomPermission.BanMembers,
      "executeAdminAction",
      (caller: ModerationCaller, targetUserId: string) =>
        caller.executeAdminAction({ roomId, targetUserId, type: AdminActionType.CreateBan }),
    ],
    [
      RoomPermission.BanMembers,
      "deleteBan",
      (caller: ModerationCaller, targetUserId: string) => caller.deleteBan({ roomId, userId: targetUserId }),
    ],
    [
      RoomPermission.ManageRoom,
      "readModerationLog",
      (caller: ModerationCaller) => caller.readModerationLog({ ...emptyFilters, roomId }),
    ],
    [
      RoomPermission.KickMembers,
      "createModerationNote",
      (caller: ModerationCaller, targetUserId: string) => caller.createModerationNote({ note, roomId, targetUserId }),
    ],
    [
      RoomPermission.KickMembers,
      "readModerationNotes",
      (caller: ModerationCaller, targetUserId: string) => caller.readModerationNotes({ roomId, targetUserId }),
    ],
  ])("member without %s permission cannot %s — throws UNAUTHORIZED", async (_permission, _procedureName, moderate) => {
    expect.hasAssertions();

    // A separate target, because moderating yourself is rejected before any permission is read
    const target = await createMember();
    const member = await createMember();
    const memberCaller = await createMockCaller(moderationRouter, await createMockAuthSession(mockContext.db, member));

    await expect(moderate(memberCaller, target.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  // Holding the permission is not enough: the target has to sit below the actor, and equal is not below. Each row
  // Reaches `isManageable` down a different procedure's path, which is the part that is not shared
  test.each([
    [
      RoomPermission.BanMembers,
      "executeAdminAction",
      (caller: ModerationCaller, targetUserId: string) =>
        caller.executeAdminAction({ roomId, targetUserId, type: AdminActionType.CreateBan }),
    ],
    [
      RoomPermission.KickMembers,
      "createModerationNote",
      (caller: ModerationCaller, targetUserId: string) => caller.createModerationNote({ note, roomId, targetUserId }),
    ],
    [
      RoomPermission.KickMembers,
      "readModerationNotes",
      (caller: ModerationCaller, targetUserId: string) => caller.readModerationNotes({ roomId, targetUserId }),
    ],
  ])(
    "isManageable: %s cannot %s against a member at equal position — throws UNAUTHORIZED",
    async (permission, _procedureName, moderate) => {
      expect.hasAssertions();

      const { member: actor } = await setupMemberWithRole(permission, position);
      const { member: target } = await setupMemberWithRole(0n, position);
      const actorCaller = await createMockCaller(moderationRouter, await createMockAuthSession(mockContext.db, actor));

      await expect(moderate(actorCaller, target.id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: UNAUTHORIZED]`,
      );
    },
  );
});
