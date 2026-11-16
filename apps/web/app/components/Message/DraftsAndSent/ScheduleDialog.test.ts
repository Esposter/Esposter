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

  // The composer is emptied as the schedule is sent, so a refused schedule has to hand it the draft it held back.
  // The dialog is opened through its store the way a drafts row opens it, and the refusal is awaited through the
  // Write's own queue before the composer is read
  test("a refused schedule hands the composer its draft back", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessage.createScheduledMessage.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
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

    expect(inputStore.getComposerInput(composerTarget)).toBe(content);
    expect(drafts.value.get(room.id)?.content).toBe(content);
  });
});
