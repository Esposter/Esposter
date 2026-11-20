// @vitest-environment nuxt
import MessageDraftsAndSentScheduleDialog from "#src/components/Message/DraftsAndSent/ScheduleDialog.vue";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "#src/store/message/input/index";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("messageDraftsAndSentScheduleDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("name");
  const content = "a";
  const composerTarget = { roomId: room.id, threadRootId: 0 };

  // The dialog stays open on the draft it was sent with when the server refuses the schedule, so the message and its
  // Time are there to send again, and the composer keeps the message it was scheduled from. The dialog is opened through
  // Its store the way a drafts row opens it, and the refusal is awaited through the write before the state is read
  test("a refused schedule leaves the dialog open with its draft", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessage.createScheduledMessage.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
    const { isOpen, target } = storeToRefs(draftsAndSentScheduleDialogStore);
    const { open } = draftsAndSentScheduleDialogStore;
    inputStore.setDraft(room.id, content);
    const component = await mountSuspended(MessageDraftsAndSentScheduleDialog, { attachTo: document.body });
    open({ content, ...composerTarget });
    await flushPromises();
    const confirmButton = component.findAll("button").find((button) => button.text() === "Schedule Message");
    assert.exists(confirmButton);
    confirmButton.element.click();
    await flushPromises();
    await waitForSynchronizedFunctions();

    expect(isOpen.value).toBe(true);
    expect(target.value).toStrictEqual({ content, ...composerTarget });
    expect(inputStore.getComposerInput(composerTarget)).toBe(content);
    expect(drafts.value.get(room.id)?.content).toBe(content);
  });
});
