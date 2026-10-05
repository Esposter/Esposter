import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { inviteRouter } from "#server/trpc/routers/invite";
import { roomRouter } from "#server/trpc/routers/room";
import { createDirectMessageWithFriend } from "#server/trpc/routers/room/createDirectMessageWithFriend.test";
import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { createId } from "#shared/util/math/random/createId";
import {
  DatabaseEntityType,
  friendsInSocial,
  INVITE_ID_LENGTH,
  invitesInMessage,
  roomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The id generator is the seam a collision is injected at; it delegates to the real one by default, so every
// Other test is unaffected
const { createIdMock } = vi.hoisted(() => ({
  createIdMock: vi.fn<typeof import("#shared/util/math/random/createId").createId>(),
}));

vi.mock(import("#shared/util/math/random/createId"), async (importOriginal) => {
  const original = await importOriginal();
  createIdMock.mockImplementation(original.createId);
  return { createId: createIdMock };
});

describe("inviteRouter", () => {
  let mockContext: Context;
  let inviteCaller: DecorateRouterRecord<TRPCRouter["invite"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  const expireAfterMinutes = InviteExpireAfterMinutesMap["30 minutes"];
  const maxUses = takeOne([...INVITE_MAX_USES_OPTIONS]);
  // A link that never lapses, which is what every test not about expiry or exhaustion reads through
  const createUnlimitedInvite = (inviteRoomId: string) =>
    inviteCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: inviteRoomId });

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

  test("reads non-existent invite", async () => {
    expect.hasAssertions();

    const invite = await inviteCaller.readInvite(createId(INVITE_ID_LENGTH));

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
    vi.setSystemTime(Temporal.Duration.from({ minutes: expireAfterMinutes + 1 }).total("milliseconds"));
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
    const usableInviteId = createId(INVITE_ID_LENGTH);
    const epoch = new Date(0);
    const oneSecondIn = new Date(Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
    const twoSecondsIn = new Date(Temporal.Duration.from({ seconds: 2 }).total("milliseconds"));
    // Newest first, so the two lapsed links are the whole of a two-row page and the usable one sits behind them
    await mockContext.db.insert(invitesInMessage).values([
      { createdAt: twoSecondsIn, expiresAt: epoch, id: createId(INVITE_ID_LENGTH), roomId: newRoom.id, userId },
      { createdAt: oneSecondIn, expiresAt: epoch, id: createId(INVITE_ID_LENGTH), roomId: newRoom.id, userId },
      { createdAt: epoch, id: usableInviteId, roomId: newRoom.id, userId },
    ]);
    vi.setSystemTime(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const lapsedPage = await inviteCaller.readRoomInvites({ limit: 2, roomId: newRoom.id });

    assert(lapsedPage.nextCursor);

    const usablePage = await inviteCaller.readRoomInvites({
      cursor: lapsedPage.nextCursor,
      limit: 2,
      roomId: newRoom.id,
    });

    expect(lapsedPage.items).toStrictEqual([]);
    expect(lapsedPage.hasMore).toBe(true);
    expect(usablePage.items.map(({ id }) => id)).toStrictEqual([usableInviteId]);
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
    await mockSessionOnce(mockContext.db, member);
    createIdMock.mockReturnValueOnce(myInvite.id);
    const invite = await createUnlimitedInvite(newRoom.id);

    expect(createIdMock).toHaveReturnedWith(myInvite.id);
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
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(
      inviteCaller.revokeInvite({ id: newInvite.id, roomId: newRoom.id }),
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
});
