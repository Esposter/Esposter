import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { banRoomMember } from "#server/services/message/moderation/banRoomMember";
import { createCallerFactory } from "#server/trpc";
import { createMockAuthSession, createMockCaller, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { inviteRouter } from "#server/trpc/routers/invite";
import { roomRouter } from "#server/trpc/routers/room";
import { createDirectMessageWithFriend } from "#server/trpc/routers/room/createDirectMessageWithFriend.test";
import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { DatabaseEntityType, friendsInSocial, invitesInMessage, roomsInMessage } from "@esposter/db-schema";
import { generateSecretToken, InvalidOperationError, Operation, SECRET_TOKEN_LENGTH, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The code generator is the seam a collision is injected at; it delegates to the real one by default, so every
// Other test is unaffected
const { generateSecretTokenMock } = vi.hoisted(() => ({
  generateSecretTokenMock: vi.fn<typeof import("@esposter/shared").generateSecretToken>(),
}));

vi.mock(import("@esposter/shared"), async (importOriginal) => {
  const original = await importOriginal();
  generateSecretTokenMock.mockImplementation(original.generateSecretToken);
  return { ...original, generateSecretToken: generateSecretTokenMock };
});

describe("inviteRouter", () => {
  let mockContext: Context;
  let inviteCaller: DecorateRouterRecord<TRPCRouter["invite"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  const expireAfterMinutes = InviteExpireAfterMinutesMap["30 minutes"];
  const maxUses = takeOne([...INVITE_MAX_USES_OPTIONS]);
  const epoch = new Date(0);
  const oneSecondIn = new Date(Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  const twoSecondsIn = new Date(Temporal.Duration.from({ seconds: 2 }).total("milliseconds"));
  // A link that never lapses, which is what every test not about expiry or exhaustion reads through. It creates as the
  // Default caller unless a test names the one acting
  const createUnlimitedInvite = (inviteRoomId: string, caller = inviteCaller) =>
    caller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: inviteRoomId });

  beforeAll(async () => {
    mockContext = await createMockContext();
    inviteCaller = createCallerFactory(inviteRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockContext.db.delete(friendsInSocial);
    await mockContext.db.delete(roomsInMessage);
  });

  test("reads invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const invite = await inviteCaller.readInvite(newInvite.id);
    const userId = getMockSession().user.id;

    assert.exists(invite);

    expect(invite.userId).toBe(userId);
    expect(invite.roomId).toBe(newRoom.id);
    expect(invite.id).toBe(newInvite.id);
    expect(invite.isMember).toBe(true);
  });

  // The landing page is readable by anyone holding the code, so it carries how many are in the room and never who
  test("reads the room's member count, not its members, to a stranger", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const joinerRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db));
    await joinerRoomCaller.joinRoom(newInvite.id);
    const strangerInviteCaller = await createMockCaller(inviteRouter, await createMockAuthSession(mockContext.db));
    const invite = await strangerInviteCaller.readInvite(newInvite.id);

    assert.exists(invite);

    expect(invite.isMember).toBe(false);
    expect(invite.room.memberCount).toBe(2);
    expect(invite.room).not.toHaveProperty("usersToRoomsInMessage");
  });

  test("reads non-existent invite", async () => {
    expect.hasAssertions();

    const invite = await inviteCaller.readInvite(generateSecretToken());

    expect(invite).toBeUndefined();
  });

  // A paused room answers its live links as it answers unknown codes, so the landing page cannot tell them apart
  test("reads no invite for a paused room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    await roomCaller.updateRoom({ id: newRoom.id, isInvitePaused: true });
    const invite = await inviteCaller.readInvite(newInvite.id);

    expect(invite).toBeUndefined();
  });

  // The ban is written by the service the moderation procedure calls, which keeps the realtime room out of this suite.
  // A banned member is refused the link they joined through, though the link is live and its room open
  test("reads no invite to a member banned from its room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const memberAuthSession = await createMockAuthSession(mockContext.db);
    const memberRoomCaller = await createMockCaller(roomRouter, memberAuthSession);
    await memberRoomCaller.joinRoom(newInvite.id);
    await banRoomMember(mockContext.db, getMockSession().user.id, newRoom.id, memberAuthSession.user.id);
    const memberInviteCaller = await createMockCaller(inviteRouter, memberAuthSession);
    const invite = await memberInviteCaller.readInvite(newInvite.id);

    expect(invite).toBeUndefined();
  });

  test("reads my invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const myInvite = await inviteCaller.readMyInvite({ roomId: newRoom.id });

    assert.exists(myInvite);

    // The creator rides back with a created link because the management panel lists that column; a member reading
    // Their own link already knows who minted it, so that half is the whole difference between the two rows
    expect(newInvite).toStrictEqual({ ...myInvite, user: newInvite.user });
    expect(newInvite.user.id).toBe(getMockSession().user.id);
  });

  test("reads my invite with no invite to be undefined", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const myInvite = await inviteCaller.readMyInvite({ roomId: newRoom.id });

    expect(myInvite).toBeUndefined();
  });

  test("reads my expired invite to be undefined", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await inviteCaller.createInvite({ expireAfterMinutes, maxUses: 0, roomId: newRoom.id });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: expireAfterMinutes + 1 }));
    const myInvite = await inviteCaller.readMyInvite({ roomId: newRoom.id });

    expect(myInvite).toBeUndefined();
  });

  // The usability predicate runs over the page rather than in SQL, so a page can filter down to fewer rows than it
  // Read — and the cursor has to name the oldest row read rather than the oldest usable one, or a batch of lapsed
  // Links ends the walk in front of the usable ones behind them
  test("keeps paging room invites past a page of lapsed links", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { id: userId } = getMockSession().user;
    const usableInviteId = "a".repeat(SECRET_TOKEN_LENGTH);
    // Paging sorts newest first, and these rows are created in the order their codes descend, so the two lapsed links
    // Fill a two-row page and the usable one sits behind them
    await mockContext.db.insert(invitesInMessage).values([
      { createdAt: twoSecondsIn, expiresAt: epoch, id: "c".repeat(SECRET_TOKEN_LENGTH), roomId: newRoom.id, userId },
      { createdAt: oneSecondIn, expiresAt: epoch, id: "b".repeat(SECRET_TOKEN_LENGTH), roomId: newRoom.id, userId },
      { createdAt: epoch, id: usableInviteId, roomId: newRoom.id, userId },
    ]);
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: 1 }));
    const lapsedPage = await inviteCaller.readRoomInvites({ limit: 2, roomId: newRoom.id });

    assert(lapsedPage.nextCursor);

    const usablePage = await inviteCaller.readRoomInvites({
      cursor: lapsedPage.nextCursor,
      limit: 2,
      roomId: newRoom.id,
    });

    expect(lapsedPage.items).toStrictEqual([]);
    expect(usablePage.items.map(({ id }) => id)).toStrictEqual([usableInviteId]);
  });

  // Newest first, and the rows that tie on creation time fall across both page boundaries, so only the id keeps them
  // Apart. The newest row carries the smallest code, so it lists first on its time alone, not on the order of codes
  test("reads every room invite to the end across page boundaries, newest first", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { id: userId } = getMockSession().user;
    const newestInviteId = "a".repeat(SECRET_TOKEN_LENGTH);
    const tiedNewerInviteIds = ["d", "c"].map((character) => character.repeat(SECRET_TOKEN_LENGTH));
    const tiedOlderInviteIds = ["f", "b"].map((character) => character.repeat(SECRET_TOKEN_LENGTH));
    await mockContext.db
      .insert(invitesInMessage)
      .values([
        { createdAt: twoSecondsIn, id: newestInviteId, roomId: newRoom.id, userId },
        ...tiedNewerInviteIds.map((id) => ({ createdAt: oneSecondIn, id, roomId: newRoom.id, userId })),
        ...tiedOlderInviteIds.map((id) => ({ createdAt: epoch, id, roomId: newRoom.id, userId })),
      ]);
    const firstPage = await inviteCaller.readRoomInvites({ limit: 2, roomId: newRoom.id });
    const secondPage = await inviteCaller.readRoomInvites({
      cursor: firstPage.nextCursor,
      limit: 2,
      roomId: newRoom.id,
    });
    const lastPage = await inviteCaller.readRoomInvites({
      cursor: secondPage.nextCursor,
      limit: 2,
      roomId: newRoom.id,
    });

    expect([...firstPage.items, ...secondPage.items, ...lastPage.items].map(({ id }) => id)).toStrictEqual([
      newestInviteId,
      ...tiedNewerInviteIds,
      ...tiedOlderInviteIds,
    ]);
    expect(lastPage.nextCursor).toBe("");
  });

  test("creating again replaces the previous invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const firstInvite = await createUnlimitedInvite(newRoom.id);
    const secondInvite = await createUnlimitedInvite(newRoom.id);
    const myInvite = await inviteCaller.readMyInvite({ roomId: newRoom.id });

    expect(secondInvite.id).not.toBe(firstInvite.id);
    expect(secondInvite).toStrictEqual({ ...myInvite, user: secondInvite.user });
  });

  // The insert that finds the collision aborts the transaction it runs in, so a retry that is not its own
  // Savepoint fails as "transaction aborted" and the create reports an id-allocation failure for a room whose
  // Next id was free
  test("re-rolls an invite id that collides with another member's link", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    const myInvite = await inviteCaller.readMyInvite({ roomId: newRoom.id });
    assert(myInvite);
    const memberInviteCaller = await createMockCaller(
      inviteRouter,
      await createMockAuthSession(mockContext.db, member),
    );
    generateSecretTokenMock.mockReturnValueOnce(myInvite.id);
    const invite = await createUnlimitedInvite(newRoom.id, memberInviteCaller);

    expect(generateSecretTokenMock).toHaveReturnedWith(myInvite.id);
    expect(invite.id).not.toBe(myInvite.id);
  });

  test("creates invite with expiry and max uses", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await inviteCaller.createInvite({ expireAfterMinutes, maxUses, roomId: newRoom.id });

    expect(newInvite.expiresAt).toStrictEqual(
      new Date(Temporal.Duration.from({ minutes: expireAfterMinutes }).total("milliseconds")),
    );
    expect(newInvite.maxUses).toBe(maxUses);
    expect(newInvite.uses).toBe(0);
  });

  test("revoking own invite makes the link unknown, and another member's is not revocable", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    // The member who joined through the link holds no link of their own, so revoking that one matches no row
    const memberAuthSession = await createMockAuthSession(mockContext.db);
    const memberRoomCaller = await createMockCaller(roomRouter, memberAuthSession);
    await memberRoomCaller.joinRoom(newInvite.id);
    const memberInviteCaller = await createMockCaller(inviteRouter, memberAuthSession);

    await expect(
      memberInviteCaller.revokeInvite({ id: newInvite.id, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    await inviteCaller.revokeInvite({ id: newInvite.id, roomId: newRoom.id });
    const invite = await inviteCaller.readInvite(newInvite.id);

    expect(invite).toBeUndefined();
  });

  test("fails create invite with direct message room", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);

    await expect(createUnlimitedInvite(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, directMessage.id).message}]`,
    );
  });

  test("fails read invite token with direct message room", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);

    await expect(inviteCaller.readMyInvite({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, directMessage.id).message}]`,
    );
  });

  test("issues a code of 256 bits, which a link carries as a base64url string", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const invite = await createUnlimitedInvite(newRoom.id);

    expect(invite.id).toHaveLength(SECRET_TOKEN_LENGTH);
  });
});
