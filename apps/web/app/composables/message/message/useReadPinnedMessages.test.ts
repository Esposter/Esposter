// @vitest-environment nuxt
import { useReadPinnedMessages } from "#src/composables/message/message/useReadPinnedMessages";
import { createMessage } from "#src/services/message/message/createMessage.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserStore } from "#src/store/message/user/index";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadPinnedMessages, () => {
  const { trpcMsw } = setupMswTrpc();
  let readPinnedMessages: ReturnType<typeof useReadPinnedMessages>["readPinnedMessages"];

  // A pinned row names its author as a room's message does, so the authors of a pinned page are read with the page
  test("reads the author of each pinned message it returns", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const userId = v7();
    trpcMsw.message.readMessages.query(() => ({
      items: [{ ...createMessage(roomId), isPinned: true, userId }],
      nextCursor: "",
    }));
    trpcMsw.room.readUsersByIds.query(() => [{ ...createUser({ id: userId }), displayName: "", isMember: true }]);
    trpcMsw.message.emoji.readReactions.query(() => []);
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setRouteId(roomId);
          ({ readPinnedMessages } = useReadPinnedMessages());
        },
      }),
    );
    await readPinnedMessages();
    const userStore = useUserStore();
    const { userMap } = storeToRefs(userStore);

    expect(userMap.value.get(userId)?.id).toBe(userId);
  });
});
