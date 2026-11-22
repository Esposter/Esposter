// @vitest-environment nuxt
import type { FriendRequestInSocialWithRelations } from "@esposter/db-schema";

import MessageModelUserProfileCard from "#src/components/Message/Model/User/ProfileCard/Index.vue";
import { createFriendRequest } from "#src/services/message/user/createFriendRequest.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageModelUserProfileCard", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const user = createUser({ name: "globalName" });
  const displayName = "displayName";

  // The member row this card pops out of resolves the displayName, so a card reading the global name renames the
  // Person under the cursor the moment the popout opens
  test("names the member the way its room does", async () => {
    expect.hasAssertions();

    trpcMsw.room.readMutualRooms.query(() => []);
    const component = await mountSuspended(MessageModelUserProfileCard, { props: { user: { ...user, displayName } } });
    setRouteId(roomId);
    await flushPromises();

    expect(component.text()).toMatchInlineSnapshot(`"DAdd frienddisplayName actionsCopy user ID displayNameOnline"`);
  });

  // The add friend write is awaited and shows nothing until the server answers, so its button holds busy meanwhile
  test("holds the add friend button busy while its request is out", async () => {
    expect.hasAssertions();

    const { promise: sendAnswered, resolve: answerSend } = Promise.withResolvers<FriendRequestInSocialWithRelations>();
    trpcMsw.room.readMutualRooms.query(() => []);
    trpcMsw.friendRequest.sendFriendRequest.mutation(() => sendAnswered);
    const component = await mountSuspended(MessageModelUserProfileCard, { props: { user: { ...user, displayName } } });
    setRouteId(roomId);
    await flushPromises();
    const addFriendButton = component.findAll("button").find((button) => button.text() === "Add friend");
    await addFriendButton?.trigger("click");
    await flushPromises();

    expect(addFriendButton?.attributes("aria-busy")).toBe("true");

    answerSend(createFriendRequest(createUser(), user));
    await flushPromises();
  });
});
