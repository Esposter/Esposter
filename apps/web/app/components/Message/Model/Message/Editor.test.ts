// @vitest-environment nuxt
import type { ClientMessage } from "#src/models/message/ClientMessage";

import MessageModelMessageEditor from "#src/components/Message/Model/Message/Editor.vue";
import { createMessage } from "#src/services/message/message/createMessage.test";
import { findButton } from "#src/services/shared/findButton.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe("messageModelMessageEditor", () => {
  const { trpcMsw } = setupMswTrpc();

  // The save is held open until the room answers, and the draft stays in the editor under it, so a Cancel pressed
  // Meanwhile would drop the draft the room is about to keep. Cancel, and Escape as a second Cancel, wait for the save
  test("holds Cancel and Escape while the edit is being saved", async () => {
    expect.hasAssertions();

    const { promise: answer, resolve: answerUpdate } = Promise.withResolvers<ClientMessage>();
    trpcMsw.message.updateMessage.mutation(() => answer);
    const roomId = v7();
    const message = createMessage(roomId, "<p>original</p>");
    const onUpdateMode = vi.fn<() => void>();
    const component = await mountSuspended({
      render: () => h(MessageModelMessageEditor, { message, "onUpdate:update-mode": onUpdateMode }),
    });
    await flushPromises();
    component.findComponent({ name: "RichTextEditor" }).vm.$emit("update:modelValue", "<p>edited</p>");
    await flushPromises();
    expect(findButton(component, "Cancel").disabled).toBe(false);

    findButton(component, "Save").click();
    await flushPromises();
    await component.findComponent({ name: "RichTextEditor" }).trigger("keydown", { key: "Escape" });

    expect(findButton(component, "Cancel").disabled).toBe(true);
    expect(onUpdateMode).not.toHaveBeenCalled();
    answerUpdate(createMessage(roomId, "<p>edited</p>"));
    await flushPromises();
  });
});
