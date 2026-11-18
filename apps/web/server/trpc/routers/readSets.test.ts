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
      joins: [
        {
          left: { column: "resourceId", selectedAs: "resourceId", table: "app_bookmarks" },
          right: { column: "resourceId", table: "resource_resourcePublications" },
        },
        {
          left: { column: "resourceId", selectedAs: "resourceId", table: "app_bookmarks" },
          right: { column: "id", table: "resource_resources" },
        },
        {
          left: { column: "roomId", selectedAs: "roomId", table: "app_bookmarks" },
          right: { column: "roomId", selectedAs: "roomMemberId", table: "message_usersToRooms" },
        },
      ],
      levels: [
        {
          scopedTables: ["app_bookmarks", "message_usersToRooms"],
          tables: ["app_bookmarks", "message_usersToRooms", "resource_resources"],
        },
        { scopedTables: [], tables: ["resource_resourcePublications"] },
      ],
      nullChecks: [
        { column: "resourceId", table: "app_bookmarks" },
        { column: "deletedAt", table: "resource_resources" },
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
      joins: [
        {
          left: { column: "id", table: "auth_users" },
          right: { column: "userId", selectedAs: "userId", table: "post_posts" },
        },
        {
          left: { column: "postId", table: "post_likes" },
          right: { column: "id", selectedAs: "id", table: "post_posts" },
        },
        {
          left: { column: "userId", selectedAs: "userId", table: "post_posts" },
          right: { column: "blockedId", table: "social_blocks" },
        },
      ],
      levels: [
        { scopedTables: ["post_likes"], tables: ["auth_users", "post_likes", "post_posts"] },
        { scopedTables: ["social_blocks"], tables: ["social_blocks"] },
      ],
      nullChecks: [{ column: "parentId", table: "post_posts" }],
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
      joins: [
        { left: { column: "id", table: "auth_users" }, right: { column: "userId", table: "message_usersToRooms" } },
        {
          left: { column: "id", selectedAs: "id", table: "message_rooms" },
          right: { column: "roomId", table: "message_usersToRooms" },
        },
      ],
      levels: [
        { scopedTables: ["message_usersToRooms"], tables: ["message_rooms", "message_usersToRooms"] },
        { scopedTables: [], tables: ["auth_users", "message_rooms", "message_usersToRooms"] },
      ],
      nullChecks: [],
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
      joins: [
        {
          left: { column: "id", selectedAs: "id", table: "auth_users" },
          right: { column: "blockedId", table: "social_blocks" },
        },
      ],
      levels: [
        { scopedTables: [], tables: ["auth_users"] },
        { scopedTables: ["social_blocks"], tables: ["social_blocks"] },
      ],
      nullChecks: [{ column: "blockedId", table: "social_blocks" }],
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
      joins: [
        {
          left: { column: "roomId", table: "message_bans" },
          right: { column: "roomId", selectedAs: "roomId", table: "message_invites" },
        },
        {
          left: { column: "roomId", selectedAs: "roomId", table: "message_invites" },
          right: { column: "id", table: "message_rooms" },
        },
      ],
      levels: [
        { scopedTables: ["message_invites"], tables: ["message_invites"] },
        { scopedTables: [], tables: ["message_rooms"] },
        { scopedTables: ["message_bans"], tables: ["message_bans"] },
        { scopedTables: ["message_rooms"], tables: ["message_rooms"] },
        { scopedTables: ["auth_users"], tables: ["auth_users"] },
        { scopedTables: ["message_usersToRooms"], tables: ["message_usersToRooms"] },
        { scopedTables: ["message_usersToRooms"], tables: ["message_usersToRooms"] },
      ],
      nullChecks: [{ column: "deletedAt", table: "message_bans" }],
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
