// @vitest-environment nuxt
import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";

import MessageModelMemberActionDialogDisplayName from "#src/components/Message/Model/Member/ActionDialog/DisplayName.vue";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe("messageModelMemberActionDialogDisplayName", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const user = createUser();
  const displayName = "displayName";
  const newDisplayName = "newDisplayName";
  const mountDialog = () =>
    mountSuspended(MessageModelMemberActionDialogDisplayName, {
      attachTo: document.body,
      props: { displayName, modelValue: true, roomId, user },
    });

  // The write is the save's only request, and the test awaits its arrival rather than a flush, since a test that ends
  // First leaves the request in flight
  const setupUpdate = () => {
    const { promise: written, resolve: signalWritten } = Promise.withResolvers<void>();
    const updateUserToRoom = vi.fn<(input: UpdateUserToRoomInput) => void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
      updateUserToRoom(input);
      signalWritten();
      return createUserToRoom({ displayName: newDisplayName, roomId, userId: user.id });
    });
    return { updateUserToRoom, written };
  };

  // The member is the target, not the actor, so the write carries their id beside the name typed for them
  test("saves the typed name against the member the dialog was opened on", async () => {
    expect.hasAssertions();

    const { updateUserToRoom, written } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").setValue(newDisplayName);
    await component.get("input").trigger("keydown", { key: "Enter" });
    await written;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({
      displayName: newDisplayName,
      roomId,
      targetUserId: user.id,
    });
  });

  // The save sits in the footer, outside the form it submits, so a click on it has to reach the form through its id
  test("saves the typed name from the footer's Save", async () => {
    expect.hasAssertions();

    const { updateUserToRoom, written } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").setValue(newDisplayName);
    await component.get('button[type="submit"]').trigger("click");
    await written;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({
      displayName: newDisplayName,
      roomId,
      targetUserId: user.id,
    });
  });

  test("clears the member's display name on an empty save", async () => {
    expect.hasAssertions();

    const { updateUserToRoom, written } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").setValue("");
    await component.get("input").trigger("keydown", { key: "Enter" });
    await written;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({ displayName: "", roomId, targetUserId: user.id });
  });

  // Blur and Save both save, so a save of the name as it stands must write nothing, or the account name shown on the
  // Row would be stored as the room's own name. The save of the typed name comes second, so the first request out is
  // The only one a stray write could have made
  test("writes nothing when the name is saved as it stands", async () => {
    expect.hasAssertions();

    const { updateUserToRoom, written } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").trigger("keydown", { key: "Enter" });
    await flushPromises();
    await component.get("input").setValue(newDisplayName);
    await component.get("input").trigger("keydown", { key: "Enter" });
    await written;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({
      displayName: newDisplayName,
      roomId,
      targetUserId: user.id,
    });
  });
});
