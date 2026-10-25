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

  // A save reads the row back once the write has landed, so the read is the last request it makes. The test awaits that
  // read rather than a flush, since a test that ends first leaves the read in flight
  const setupUpdate = () => {
    const { promise: readBack, resolve: signalReadBack } = Promise.withResolvers<void>();
    const updateUserToRoom = vi.fn<(input: UpdateUserToRoomInput) => void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
      updateUserToRoom(input);
      return createUserToRoom({ displayName: newDisplayName, roomId, userId: user.id });
    });
    trpcMsw.room.readMembersByIds.query(() => {
      signalReadBack();
      return [{ ...user, displayName: newDisplayName }];
    });
    return { readBack, updateUserToRoom };
  };

  // The member is the target, not the actor, so the write carries their id beside the name typed for them
  test("saves the typed name against the member the dialog was opened on", async () => {
    expect.hasAssertions();

    const { readBack, updateUserToRoom } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").setValue(newDisplayName);
    await component.get("input").trigger("keydown", { key: "Enter" });
    await readBack;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({
      displayName: newDisplayName,
      roomId,
      targetUserId: user.id,
    });
  });

  test("clears the member's display name on an empty save", async () => {
    expect.hasAssertions();

    const { readBack, updateUserToRoom } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").setValue("");
    await component.get("input").trigger("keydown", { key: "Enter" });
    await readBack;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({ displayName: "", roomId, targetUserId: user.id });
  });

  // Blur and Save both save, so a save of the name as it stands must write nothing, or the account name shown on the
  // Row would be stored as the room's own name. The save of the typed name comes second, so the first request out is
  // The only one a stray write could have made
  test("writes nothing when the name is saved as it stands", async () => {
    expect.hasAssertions();

    const { readBack, updateUserToRoom } = setupUpdate();
    const component = await mountDialog();
    await component.get("input").trigger("keydown", { key: "Enter" });
    await flushPromises();
    await component.get("input").setValue(newDisplayName);
    await component.get("input").trigger("keydown", { key: "Enter" });
    await readBack;

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({
      displayName: newDisplayName,
      roomId,
      targetUserId: user.id,
    });
  });
});
