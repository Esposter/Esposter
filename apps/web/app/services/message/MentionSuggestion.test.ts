// @vitest-environment nuxt
import type { Editor } from "@tiptap/core";

import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { MentionSuggestion } from "@/services/message/MentionSuggestion";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";
import { MENTION_EVERYONE_ID, MENTION_HERE_ID, MentionType } from "@esposter/shared";
import { v7 } from "uuid";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe("mentionSuggestion", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const otherRoomId = v7();

  beforeEach(() => {
    setCurrentRoomId(roomId);
  });

  // The member read spans an await, so a room switched to in between must not supply the role suggestions — the
  // Composer would offer to mention a role the room the message is going to does not have
  test("suggests the roles of the room the query was typed in", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.room.readMembers.query(async () => {
      await readGate;
      return { hasMore: false, items: [], nextCursor: "" };
    });
    const role = createRoomRole({ roomId });
    const roleStore = useRoleStore();
    const { setRoles } = roleStore;
    setRoles(roomId, [role]);
    setRoles(otherRoomId, [createRoomRole({ roomId: otherRoomId })]);
    assert.exists(MentionSuggestion?.items);
    const pendingItems = MentionSuggestion.items({
      editor: {} as Editor,
      query: "",
      signal: new AbortController().signal,
    });
    setCurrentRoomId(otherRoomId);
    releaseRead();
    const items = await pendingItems;

    expect(items.filter((item) => "type" in item && item.type === MentionType.Role).map(({ id }) => id)).toStrictEqual([
      role.id,
    ]);
  });

  // The server strips the two room-wide mentions from a message whose sender lacks the permission, so they are offered
  // Only to a member who holds it
  test.each([
    ["holds", RoomPermission.MentionEveryone, [MENTION_EVERYONE_ID, MENTION_HERE_ID]],
    ["lacks", 0n, []],
  ])("offers the room-wide mentions to a member who %s the permission", async (_title, permissions, ids) => {
    expect.hasAssertions();

    trpcMsw.room.readMembers.query(() => ({ hasMore: false, items: [], nextCursor: "" }));
    trpcMsw.role.readMyPermissions.query(() => [{ isRoomOwner: false, permissions, roomId, topRolePosition: 0 }]);
    const roleStore = useRoleStore();
    await roleStore.readMyPermissions({ roomIds: [roomId] });
    assert.exists(MentionSuggestion?.items);
    const items = await MentionSuggestion.items({
      editor: {} as Editor,
      query: "",
      signal: new AbortController().signal,
    });

    expect(
      items.map(({ id }) => id).filter((id) => id === MENTION_EVERYONE_ID || id === MENTION_HERE_ID),
    ).toStrictEqual(ids);
  });

  // A room made or joined in this session has no permissions read yet, and the server judges what its member sends
  test("offers the room-wide mentions while the room's permissions are not read", async () => {
    expect.hasAssertions();

    setCurrentRoomId(v7());
    trpcMsw.room.readMembers.query(() => ({ hasMore: false, items: [], nextCursor: "" }));
    assert.exists(MentionSuggestion?.items);
    const items = await MentionSuggestion.items({
      editor: {} as Editor,
      query: "",
      signal: new AbortController().signal,
    });

    expect(
      items.map(({ id }) => id).filter((id) => id === MENTION_EVERYONE_ID || id === MENTION_HERE_ID),
    ).toStrictEqual([MENTION_EVERYONE_ID, MENTION_HERE_ID]);
  });
});
