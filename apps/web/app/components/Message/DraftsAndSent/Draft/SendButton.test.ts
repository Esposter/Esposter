// @vitest-environment nuxt
import type { DraftItem } from "#src/models/message/draftsAndSent/DraftItem";

import MessageDraftsAndSentDraftSendButton from "#src/components/Message/DraftsAndSent/Draft/SendButton.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useInputStore } from "#src/store/message/input/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageDraftsAndSentDraftSendButton", () => {
  setupMswTrpc();
  const room = createRoom("name");
  const threadRootId = 0;
  const content = "content";
  const draftItem: DraftItem = { composerKey: room.id, content, room, threadRootId, updatedAt: new Date() };

  // The draft stays the composer's copy of its text until the send has its bubble, which is then the sender's copy. A
  // Send that fails before the bubble exists leaves nothing else holding the text, so the draft must still be there
  test("keeps the draft when the send fails before its bubble exists", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref({ data: null }));
    const inputStore = useInputStore();
    inputStore.setDraft(room.id, content);
    const component = await mountSuspended(MessageDraftsAndSentDraftSendButton, { props: { draftItem } });
    await component.get("button").trigger("click");
    await flushPromises();

    expect(inputStore.getComposerInput({ roomId: room.id, threadRootId })).toBe(content);
  });
});
