// @vitest-environment nuxt
import type { ScheduledRoomMessage } from "@esposter/db-schema";

import MessageModelMessageInputScheduledMessageJobDialog from "#src/components/Message/Model/Message/Input/ScheduledMessageJobDialog.vue";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useScheduledMessageJobDialogStore } from "#src/store/message/input/scheduledMessageJobDialog";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, describe, expect, test } from "vitest";

describe("messageModelMessageInputScheduledMessageJobDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("name");
  const text = "a";

  // The dialog stays open on the text it was sent with when the server refuses the schedule, so the text is there to
  // Send again. The room is the route's, and the refusal is awaited through the write before the dialog is read
  test("a refused schedule leaves the dialog open with its text", async () => {
    expect.hasAssertions();

    let sendCount = 0;
    trpcMsw.message.scheduledMessage.createScheduledMessage.mutation(() => {
      sendCount += 1;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
    const { isOpen } = storeToRefs(scheduledMessageJobDialogStore);
    scheduledMessageJobDialogStore.open(ScheduledMessageJobType.ScheduledMessage);
    const component = await mountSuspended(MessageModelMessageInputScheduledMessageJobDialog, {
      attachTo: document.body,
    });
    setCurrentRoomId(room.id);
    await flushPromises();
    const textField = component.get("textarea");
    await textField.setValue(text);
    const confirmButton = component.findAll("button").find((button) => button.text() === "Schedule Message");
    assert.exists(confirmButton);
    confirmButton.element.click();
    await flushPromises();
    await waitForSynchronizedFunctions();

    expect(sendCount).toBe(1);
    expect(isOpen.value).toBe(true);
    expect(textField.element.value).toBe(text);
  });

  // The schedule the server keeps empties the text it was sent with. Text the reader typed while the server had it is the
  // Next schedule's, so it stays in the dialog when it is opened again
  test("a kept schedule keeps the text typed while the server had it", async () => {
    expect.hasAssertions();

    const { promise: isKept, resolve: keepSchedule } = Promise.withResolvers<ScheduledRoomMessage>();
    const keptSchedule: ScheduledRoomMessage = {
      deletedAt: null,
      id: 1,
      message: text,
      replyToId: null,
      runAt: new Date(0),
      userId: v7(),
      version: 0,
    };
    trpcMsw.message.scheduledMessage.createScheduledMessage.mutation(() => isKept);
    const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
    scheduledMessageJobDialogStore.open(ScheduledMessageJobType.ScheduledMessage);
    const component = await mountSuspended(MessageModelMessageInputScheduledMessageJobDialog, {
      attachTo: document.body,
    });
    setCurrentRoomId(room.id);
    await flushPromises();
    await component.get("textarea").setValue(text);
    const confirmButton = component.findAll("button").find((button) => button.text() === "Schedule Message");
    assert.exists(confirmButton);
    confirmButton.element.click();
    await flushPromises();
    await component.get("textarea").setValue("ab");
    keepSchedule(keptSchedule);
    await flushPromises();
    await waitForSynchronizedFunctions();
    scheduledMessageJobDialogStore.open(ScheduledMessageJobType.ScheduledMessage);
    await flushPromises();

    expect(component.get("textarea").element.value).toBe("ab");
  });
});
