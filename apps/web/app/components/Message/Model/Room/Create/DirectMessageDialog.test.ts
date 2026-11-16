// @vitest-environment nuxt
import MessageModelRoomCreateDirectMessageDialog from "#src/components/Message/Model/Room/Create/DirectMessageDialog.vue";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelRoomCreateDirectMessageDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const friends = [createUser(), createUser()];

  // The create's arrival is awaited rather than a flush, since a call still on its way when the test ends is never
  // Answered in time to be asserted on
  test("keeps the friends picked when the create is refused", async () => {
    expect.hasAssertions();

    trpcMsw.block.readBlockedUsers.query(() => []);
    trpcMsw.friend.readFriends.query(() => friends);
    trpcMsw.friendRequest.readFriendRequests.query(() => []);
    const { promise: requestedUserIds, resolve: onCreateRequested } = Promise.withResolvers<unknown>();
    trpcMsw.room.directMessage.createDirectMessage.mutation(({ input }) => {
      onCreateRequested(input);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountSuspended(MessageModelRoomCreateDirectMessageDialog, {
      attachTo: document.body,
      props: { modelValue: true },
    });
    // Both friends are picked from the list, so the picker has to hold several
    const getOptions = () => component.findAll('[role="option"]');
    await takeOne(getOptions(), 0).trigger("click");
    await takeOne(getOptions(), 1).trigger("click");
    await component.get('button[type="submit"]').trigger("click");
    const sentUserIds = await requestedUserIds;
    await flushPromises();

    expect(sentUserIds).toStrictEqual(friends.map(({ id }) => id));
    expect(getOptions().map((option) => option.attributes("aria-selected"))).toStrictEqual(["true", "true"]);
  });
});
