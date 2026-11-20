// @vitest-environment nuxt
import MessageModelMessageInputScheduledMessageJobDialog from "#src/components/Message/Model/Message/Input/ScheduledMessageJobDialog.vue";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useScheduledMessageJobDialogStore } from "#src/store/message/input/scheduledMessageJobDialog";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("messageModelMessageInputScheduledMessageJobDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("name");
  const text = "a";

  // The dialog stays open on the text it was sent with when the server refuses the schedule, so the text is there to
  // Send again. The room is the route's, and the refusal is awaited through the write before the dialog is read
  test("a refused schedule leaves the dialog open with its text", async () => {
    expect.hasAssertions();

    Object.assign(useRouter().currentRoute.value.params, { id: room.id });
    trpcMsw.message.scheduledMessage.createScheduledMessage.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
    const { isOpen } = storeToRefs(scheduledMessageJobDialogStore);
    scheduledMessageJobDialogStore.open(ScheduledMessageJobType.ScheduledMessage);
    const component = await mountSuspended(MessageModelMessageInputScheduledMessageJobDialog, {
      attachTo: document.body,
    });
    await flushPromises();
    const textField = component.get("textarea");
    await textField.setValue(text);
    const confirmButton = component.findAll("button").find((button) => button.text() === "Schedule Message");
    assert.exists(confirmButton);
    confirmButton.element.click();
    await flushPromises();
    await waitForSynchronizedFunctions();

    expect(isOpen.value).toBe(true);
    expect(textField.element.value).toBe(text);
  });
});
