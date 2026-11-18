import { createMockAuthSession, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { bookmarkRouter } from "#server/trpc/routers/bookmark";
import { friendRouter } from "#server/trpc/routers/friend";
import { inviteRouter } from "#server/trpc/routers/invite";
import { postRouter } from "#server/trpc/routers/post";
import { roomRouter } from "#server/trpc/routers/room/index";
import { getReadSet, recordStatements } from "@esposter/db";
import { describe, expect, test } from "vitest";

// Each read's read set is pinned from the statements the handle recorded. A scope fact is a scope column equal to a
// Value, a join fact pairs two columns where one is a scope column, and a join side is selected only when the read's
// Own select names that same table column. Joins are oriented by their columns and the lists sorted, so the sets
// Compare the same however drizzle orders its SQL
describe(getReadSet, () => {
  test("the bookmark dock reads its bookmarks, their targets and publications, and the viewer's room memberships", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const { database, statements } = recordStatements(context.db);
    await createCallerFactory(bookmarkRouter)({ ...context, db: database }).readBookmarks();

    expect(getReadSet(statements)).toStrictEqual({
      filters: [
        { column: "resourceId", level: 0, occurrence: "app_bookmarks", site: "where", table: "app_bookmarks" },
        { column: "deletedAt", level: 0, occurrence: "resource_resources", site: "where", table: "resource_resources" },
      ],
      joins: [
        {
          kind: "inner",
          left: {
            column: "resourceId",
            level: 1,
            occurrence: "app_bookmarks",
            selectedAs: "resourceId",
            table: "app_bookmarks",
          },
          right: {
            column: "resourceId",
            level: 1,
            occurrence: "resource_resourcePublications",
            table: "resource_resourcePublications",
          },
        },
        {
          kind: "left",
          left: {
            column: "resourceId",
            level: 0,
            occurrence: "app_bookmarks",
            selectedAs: "resourceId",
            table: "app_bookmarks",
          },
          nullFilled: "right",
          right: { column: "id", level: 0, occurrence: "resource_resources", table: "resource_resources" },
        },
        {
          kind: "left",
          left: {
            column: "roomId",
            level: 0,
            occurrence: "app_bookmarks",
            selectedAs: "roomId",
            table: "app_bookmarks",
          },
          nullFilled: "right",
          right: {
            column: "roomId",
            level: 0,
            occurrence: "message_usersToRooms",
            selectedAs: "roomMemberId",
            table: "message_usersToRooms",
          },
        },
      ],
      levels: [
        { tables: ["app_bookmarks", "message_usersToRooms", "resource_resources"] },
        { tables: ["resource_resourcePublications"] },
      ],
      occurrences: [
        {
          level: 1,
          occurrence: "resource_resourcePublications",
          scoped: false,
          table: "resource_resourcePublications",
        },
        { level: 0, occurrence: "app_bookmarks", scoped: true, table: "app_bookmarks" },
        { level: 0, occurrence: "resource_resources", scoped: false, table: "resource_resources" },
        { level: 0, occurrence: "message_usersToRooms", scoped: true, table: "message_usersToRooms" },
      ],
      scopes: [
        { column: "userId", table: "app_bookmarks", value: userId },
        { column: "userId", table: "message_usersToRooms", value: userId },
      ],
      tables: ["app_bookmarks", "message_usersToRooms", "resource_resourcePublications", "resource_resources"],
    });
  });

  test("the feed reads the viewer's likes and blocks, each post's author and the posts it is read from", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const { database, statements } = recordStatements(context.db);
    await createCallerFactory(postRouter)({ ...context, db: database }).readPosts();

    expect(getReadSet(statements)).toStrictEqual({
      filters: [
        { column: "parentId", level: 0, occurrence: "d0", site: "where", table: "post_posts" },
        { column: "userId", level: 0, occurrence: "d0", site: "where", table: "post_posts" },
      ],
      joins: [
        {
          kind: "inner",
          left: { column: "id", level: 0, occurrence: "d1", table: "auth_users" },
          right: { column: "userId", level: 0, occurrence: "d0", selectedAs: "userId", table: "post_posts" },
        },
        {
          kind: "inner",
          left: { column: "postId", level: 0, occurrence: "d1", table: "post_likes" },
          right: { column: "id", level: 0, occurrence: "d0", selectedAs: "id", table: "post_posts" },
        },
      ],
      levels: [
        { tables: ["auth_users", "post_likes", "post_posts"] },
        { tables: [] },
        { tables: [] },
        { tables: ["social_blocks"] },
      ],
      occurrences: [
        { level: 0, occurrence: "d1", scoped: true, table: "auth_users" },
        { level: 0, occurrence: "d1", scoped: true, table: "post_likes" },
        { level: 0, occurrence: "d0", scoped: false, table: "post_posts" },
        { level: 3, occurrence: "social_blocks", scoped: true, table: "social_blocks" },
      ],
      scopes: [
        { column: "userId", table: "post_likes", value: userId },
        { column: "blockerId", table: "social_blocks", value: userId },
      ],
      tables: ["auth_users", "post_likes", "post_posts", "social_blocks"],
    });
  });

  // The partner's user row is joined on the membership's user id, and neither side is selected by this read. The read's
  // Own selected `userId` is the room's owner, a same-named column of another table, so it must not key the partner
  test("the sidebar reads the viewer's memberships, their rooms, and each direct message's other participants", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const { database, statements } = recordStatements(context.db);
    await createCallerFactory(roomRouter)({ ...context, db: database }).readRooms();

    expect(getReadSet(statements)).toStrictEqual({
      filters: [
        { column: "type", level: 0, occurrence: "message_rooms", site: "where", table: "message_rooms" },
        { column: "type", level: 1, occurrence: "message_rooms", site: "where", table: "message_rooms" },
        {
          column: "userId",
          level: 2,
          occurrence: "participantMembership",
          site: "leftJoinOn",
          table: "message_usersToRooms",
        },
      ],
      joins: [
        {
          kind: "inner",
          left: { column: "id", level: 0, occurrence: "message_rooms", table: "message_rooms" },
          right: {
            column: "roomId",
            level: 0,
            occurrence: "message_usersToRooms",
            selectedAs: "roomId",
            table: "message_usersToRooms",
          },
        },
        {
          kind: "inner",
          left: { column: "id", level: 1, occurrence: "message_rooms", selectedAs: "id", table: "message_rooms" },
          right: { column: "roomId", level: 1, occurrence: "message_usersToRooms", table: "message_usersToRooms" },
        },
        {
          kind: "left",
          left: { column: "id", level: 1, occurrence: "message_rooms", selectedAs: "id", table: "message_rooms" },
          nullFilled: "left",
          right: { column: "id", level: 1, occurrence: "message_rooms", selectedAs: "id", table: "message_rooms" },
        },
        {
          kind: "left",
          left: { column: "id", level: 2, occurrence: "participantUser", table: "auth_users" },
          nullFilled: "left",
          right: { column: "userId", level: 2, occurrence: "participantMembership", table: "message_usersToRooms" },
        },
        {
          kind: "left",
          left: { column: "id", level: 2, occurrence: "message_rooms", selectedAs: "id", table: "message_rooms" },
          nullFilled: "right",
          right: { column: "roomId", level: 2, occurrence: "participantMembership", table: "message_usersToRooms" },
        },
      ],
      levels: [
        { tables: ["message_rooms", "message_usersToRooms"] },
        { tables: ["message_rooms", "message_usersToRooms"] },
        { tables: ["auth_users", "message_rooms", "message_usersToRooms"] },
      ],
      occurrences: [
        { level: 0, occurrence: "message_usersToRooms", scoped: true, table: "message_usersToRooms" },
        { level: 0, occurrence: "message_rooms", scoped: false, table: "message_rooms" },
        { level: 1, occurrence: "message_rooms", scoped: false, table: "message_rooms" },
        { level: 1, occurrence: "message_usersToRooms", scoped: true, table: "message_usersToRooms" },
        { level: 2, occurrence: "message_rooms", scoped: false, table: "message_rooms" },
        { level: 2, occurrence: "participantMembership", scoped: false, table: "message_usersToRooms" },
        { level: 2, occurrence: "participantUser", scoped: false, table: "auth_users" },
      ],
      scopes: [{ column: "userId", table: "message_usersToRooms", value: userId }],
      tables: ["auth_users", "message_rooms", "message_usersToRooms"],
    });
  });

  test("the name search reads the viewer's blocks in both directions and every user it searches", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const { database, statements } = recordStatements(context.db);
    await createCallerFactory(friendRouter)({ ...context, db: database }).searchUsers("User");

    // The blocks subquery's second operand names its column by name, not by column, so its join is not read here. Its
    // Scope equality is, and that equality already covers every block the join would name
    expect(getReadSet(statements)).toStrictEqual({
      filters: [
        { column: "id", level: 0, occurrence: "auth_users", site: "where", table: "auth_users" },
        { column: "name", level: 0, occurrence: "auth_users", site: "where", table: "auth_users" },
        { column: "blockedId", level: 0, occurrence: "social_blocks", site: "where", table: "social_blocks" },
      ],
      joins: [
        {
          kind: "left",
          left: { column: "id", level: 0, occurrence: "auth_users", selectedAs: "id", table: "auth_users" },
          nullFilled: "right",
          right: { column: "blockedId", level: 0, occurrence: "social_blocks", table: "social_blocks" },
        },
      ],
      levels: [{ tables: ["auth_users"] }, { tables: ["social_blocks"] }],
      occurrences: [
        { level: 0, occurrence: "auth_users", scoped: false, table: "auth_users" },
        { level: 1, occurrence: "social_blocks", scoped: true, table: "social_blocks" },
      ],
      scopes: [
        { column: "blockedId", table: "social_blocks", value: userId },
        { column: "blockerId", table: "social_blocks", value: userId },
      ],
      tables: ["auth_users", "social_blocks"],
    });
  });

  test("the landing page reads the invite, its room and the viewer's bans, the inviter, and the room's memberships", async () => {
    expect.hasAssertions();

    const inviterId = getMockSession().user.id;
    const context = await createMockContext();
    const newRoom = await createCallerFactory(roomRouter)(context).createRoom({ name: "room" });
    const newInvite = await createCallerFactory(inviteRouter)(context).createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: newRoom.id,
    });
    const reader = await createMockAuthSession(context.db);
    const { database, statements } = recordStatements(context.db);
    await createCallerFactory(inviteRouter)({
      ...context,
      db: database,
      session: reader.session,
      user: reader.user,
    }).readInvite(newInvite.id);

    expect(getReadSet(statements)).toStrictEqual({
      filters: [
        { column: "isInvitePaused", level: 1, occurrence: "message_rooms", site: "where", table: "message_rooms" },
        { column: "deletedAt", level: 2, occurrence: "message_bans", site: "where", table: "message_bans" },
      ],
      joins: [
        {
          kind: "inner",
          left: {
            column: "roomId",
            level: 1,
            occurrence: "message_invites",
            selectedAs: "roomId",
            table: "message_invites",
          },
          right: { column: "id", level: 1, occurrence: "message_rooms", table: "message_rooms" },
        },
        {
          kind: "inner",
          left: { column: "roomId", level: 2, occurrence: "message_bans", table: "message_bans" },
          right: {
            column: "roomId",
            level: 2,
            occurrence: "message_invites",
            selectedAs: "roomId",
            table: "message_invites",
          },
        },
      ],
      levels: [
        { tables: ["message_invites"] },
        { tables: ["message_rooms"] },
        { tables: ["message_bans"] },
        { tables: ["message_rooms"] },
        { tables: ["auth_users"] },
        { tables: ["message_usersToRooms"] },
        { tables: ["message_usersToRooms"] },
      ],
      occurrences: [
        { level: 0, occurrence: "message_invites", scoped: true, table: "message_invites" },
        { level: 1, occurrence: "message_rooms", scoped: false, table: "message_rooms" },
        { level: 2, occurrence: "message_bans", scoped: true, table: "message_bans" },
        { level: 3, occurrence: "d0", scoped: true, table: "message_rooms" },
        { level: 4, occurrence: "d0", scoped: true, table: "auth_users" },
        { level: 5, occurrence: "d0", scoped: true, table: "message_usersToRooms" },
        { level: 6, occurrence: "message_usersToRooms", scoped: true, table: "message_usersToRooms" },
      ],
      scopes: [
        { column: "id", table: "auth_users", value: inviterId },
        { column: "userId", table: "message_bans", value: reader.user.id },
        { column: "id", secret: true, table: "message_invites", value: newInvite.id },
        { column: "id", table: "message_rooms", value: newRoom.id },
        { column: "roomId", table: "message_usersToRooms", value: newRoom.id },
        { column: "userId", table: "message_usersToRooms", value: reader.user.id },
      ],
      tables: ["auth_users", "message_bans", "message_invites", "message_rooms", "message_usersToRooms"],
    });
  });
});
