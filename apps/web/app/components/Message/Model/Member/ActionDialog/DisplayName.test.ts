// @vitest-environment nuxt
import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";

import MessageModelMemberActionDialogDisplayName from "@/components/Message/Model/Member/ActionDialog/DisplayName.vue";
import { createUserToRoom } from "@/services/message/room/createUserToRoom.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe("messageModelMemberActionDialogDisplayName", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const user = createUser();
  const displayName = "displayName";
  const newDisplayName = "newDisplayName";
  const mountDialog = () =>
    mountSuspended(MessageModelMemberActionDialogDisplayName, {
      attachTo: document.body,
      props: { displayName, modelValue: true, roomId, user },
    });

  // The mock answers the write on its own tick, so the test awaits the request it answered rather than a flush
  const setupUpdate = () => {
    const { promise: requested, resolve: signalRequested } = Promise.withResolvers<void>();
    const updateUserToRoom = vi.fn<(input: UpdateUserToRoomInput) => void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
      updateUserToRoom(input);
      signalRequested();
      return createUserToRoom({ displayName: newDisplayName, roomId, userId: user.id });
    });
    trpcMsw.room.readMembersByIds.query(() => [{ ...user, displayName: newDisplayName }]);
    return { requested, updateUserToRoom };
  };

  // The member is the target, not the actor, so the write carries their id beside the name typed for them
  test("saves the typed name against the member the dialog was opened on", async () => {
    expect.hasAssertions();

    const { requested, updateUserToRoom } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").setValue(newDisplayName);
    await component.get("input").trigger("keydown", { key: "Enter" });
    await requested;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({
      displayName: newDisplayName,
      roomId,
      targetUserId: user.id,
    });
  });

  test("clears the member's display name on an empty save", async () => {
    expect.hasAssertions();

    const { requested, updateUserToRoom } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").setValue("");
    await component.get("input").trigger("keydown", { key: "Enter" });
    await requested;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({ displayName: "", roomId, targetUserId: user.id });
  });

  // Blur and Save both save, so a save of the name as it stands must write nothing, or the account name shown on the
  // Row would be stored as the room's own name. The save of the typed name comes second, so the first request out is
  // The only one a stray write could have made
  test("writes nothing when the name is saved as it stands", async () => {
    expect.hasAssertions();

    const { requested, updateUserToRoom } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").trigger("keydown", { key: "Enter" });
    await flushPromises();
    await component.get("input").setValue(newDisplayName);
    await component.get("input").trigger("keydown", { key: "Enter" });
    await requested;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({
      displayName: newDisplayName,
      roomId,
      targetUserId: user.id,
    });
  });
});
