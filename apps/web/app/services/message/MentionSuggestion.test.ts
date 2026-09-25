// @vitest-environment nuxt
import type { Editor } from "@tiptap/core";

import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { MentionSuggestion } from "@/services/message/MentionSuggestion";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { MentionType } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe("mentionSuggestion", () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(roomId);
  });

  // The member read spans an await, so a room switched to in between must not supply the role suggestions — the
  // Composer would offer to mention a role the room the message is going to does not have
  test("suggests the roles of the room the query was typed in", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.room.readMembers.query(async () => {
        await readGate;
        return { hasMore: false, items: [], nextCursor: "" };
      }),
    );
    const role = createRoomRole({ roomId });
    const roleStore = useRoleStore();
    const { setRoles } = roleStore;
    setRoles(roomId, [role]);
    setRoles(otherRoomId, [createRoomRole({ roomId: otherRoomId })]);
    assert.exists(MentionSuggestion?.items);
    const pendingItems = MentionSuggestion.items({ editor: {} as Editor, query: "" });
    setCurrentRoomId(otherRoomId);
    releaseRead();
    const items = await pendingItems;

    expect(items.filter((item) => "type" in item && item.type === MentionType.Role).map(({ id }) => id)).toStrictEqual([
      role.id,
    ]);
  });
});
