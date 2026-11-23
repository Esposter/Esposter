// @vitest-environment nuxt
import type { CreateDirectMessageParticipantsInput } from "#shared/models/db/room/CreateDirectMessageParticipantsInput";

import MessageContentHeaderCreateDirectMessageParticipantDialog from "#src/components/Message/Content/Header/CreateDirectMessageParticipantDialog.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { createFriend } from "#src/services/message/user/createFriend.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe("messageContentHeaderCreateDirectMessageParticipantDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const appUser = createUser();
  const friend = createUser();

  // The dialog awaits `useAuthSession()`, which reads the fetcher form (an object holding `data`), while the friend
  // Store Reads `useSessionUserId()`, the ref form, so the double answers both with the same signed-in user
  beforeEach(() => {
    const session = { user: { id: appUser.id } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
  });

  // The picker lists the viewer's friends, so the reads it makes are answered before the dialog is driven
  const answerFriendPicker = () => {
    trpcMsw.block.readBlockedUsers.query(() => []);
    trpcMsw.friend.readFriends.query(() => [createFriend(appUser, friend)]);
    trpcMsw.friendRequest.readFriendRequests.query(() => []);
  };

  test("the add sends the picked friend to the room", async () => {
    expect.hasAssertions();

    answerFriendPicker();
    const { promise: requestedInput, resolve: onRequested } =
      Promise.withResolvers<CreateDirectMessageParticipantsInput>();
    trpcMsw.room.directMessage.createDirectMessageParticipants.mutation(({ input }) => {
      onRequested(input);
      return [];
    });
    const roomId = v7();
    const component = await mountSuspended(MessageContentHeaderCreateDirectMessageParticipantDialog, {
      attachTo: document.body,
      props: { modelValue: true, roomId },
    });
    await takeOne(component.findAll('[role="option"]'), 0).trigger("click");
    await component.get('button[type="submit"]').trigger("click");
    const sentInput = await requestedInput;
    await flushPromises();

    expect(sentInput).toStrictEqual({ roomId, userIds: [friend.id] });
  });

  // The add the server refuses, submitted with one friend picked, answered by the time this returns
  const submitRefusedAdd = async () => {
    answerFriendPicker();
    const { promise: requested, resolve: onRequested } = Promise.withResolvers<void>();
    trpcMsw.room.directMessage.createDirectMessageParticipants.mutation(() => {
      onRequested();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountSuspended(MessageContentHeaderCreateDirectMessageParticipantDialog, {
      attachTo: document.body,
      props: { modelValue: true, roomId: v7() },
    });
    await takeOne(component.findAll('[role="option"]'), 0).trigger("click");
    await component.get('button[type="submit"]').trigger("click");
    await requested;
    await flushPromises();

    return component;
  };

  // The write is the dialog's own, so a refusal is raised by the dialog's write and nowhere else: without its error
  // Handler the add fails in silence, and the reader is never told it did not happen
  test("a refused add raises the error alert", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await submitRefusedAdd();

    expect(alerts.value.map(({ text }) => text)).toStrictEqual([" "]);
  });

  test("a refused add keeps the dialog open on the friend picked", async () => {
    expect.hasAssertions();

    const component = await submitRefusedAdd();

    expect(component.emitted("update:modelValue")).toBeUndefined();
  });
});
