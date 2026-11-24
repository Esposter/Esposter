// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import MessageModelMessageForwardSendButton from "#src/components/Message/Model/Message/Forward/SendButton.vue";
import { createMessage } from "#src/services/message/message/createMessage.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useForwardStore } from "#src/store/message/input/forward";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// The dialog's one button, whatever its label is: a Send in flight is pending, and its label is not Send while it is
// Pending
const clickSend = (component: VueWrapper) => {
  component.get("button").element.click();
};

describe("messageModelMessageForwardSendButton", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const destinationRoomId = v7();

  // The forward is out until the server answers it, and the dialog that sent it can close meanwhile. A dialog opened
  // Again over the same panel must not send the forward a second time while the first is still out
  test("a Send pressed in a reopened dialog does not send a forward the server has yet to answer", async () => {
    expect.hasAssertions();

    const { promise: isAnswered, resolve: answerForward } = Promise.withResolvers<void>();
    let sendCount = 0;
    trpcMsw.message.forwardMessage.mutation(() => {
      sendCount += 1;
      return isAnswered;
    });
    const forward = createMessage(roomId);
    const sentDialog = await mountSuspended(MessageModelMessageForwardSendButton, { props: { forward } });
    setRouteId(roomId);
    const forwardStore = useForwardStore();
    const { roomIds } = storeToRefs(forwardStore);
    roomIds.value = [destinationRoomId];
    await flushPromises();
    clickSend(sentDialog);
    sentDialog.unmount();
    const reopenedDialog = await mountSuspended(MessageModelMessageForwardSendButton, { props: { forward } });
    setRouteId(roomId);
    await flushPromises();
    clickSend(reopenedDialog);
    await flushPromises();
    answerForward();
    await flushPromises();

    expect(sendCount).toBe(1);
  });
});
