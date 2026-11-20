// @vitest-environment nuxt
import type { MemberRowInRoom } from "#shared/models/db/room/MemberRowInRoom";
import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";

import MessageModelMemberActionDialogDisplayName from "#src/components/Message/Model/Member/ActionDialog/DisplayName.vue";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserStore } from "#src/store/message/user/index";
import { useMemberStore } from "#src/store/message/user/member";
import { takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

// The row the member list draws for the member
const getMemberRow = () => {
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  return takeOne(members.value);
};

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
  const memberRow: MemberRowInRoom = { ...user, deletedAt: null, displayName, roomId, userId: user.id, version: 0 };
  // The member the dialog was opened on, as the room's first page read left it: the person, and the membership row the
  // Page held. The list is the room's, so the room is made current here, after the dialog mounts, since a mount resets the route
  const seedMember = async () => {
    setCurrentRoomId(roomId);
    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser(user);
    const memberStore = useMemberStore();
    const { arriveMemberPage, readItems } = memberStore;
    await readItems(() => Promise.resolve(arriveMemberPage({ items: [memberRow], nextCursor: "" })));
  };

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

  // A blank name is stored as the account's own name, so the row shows that name from the save, before the server answers
  test("a blank display name shows the account's name at once", async () => {
    expect.hasAssertions();

    const { promise: isWriteReached, resolve: onWriteReached } = Promise.withResolvers<void>();
    const { promise: isWriteAnswered, resolve: answerWrite } = Promise.withResolvers<void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(async () => {
      onWriteReached();
      await isWriteAnswered;
      return createUserToRoom({ displayName: user.name, roomId, userId: user.id });
    });
    const component = await mountDialog();
    await seedMember();
    await component.get("input").setValue(" ");
    await component.get("input").trigger("keydown", { key: "Enter" });
    await isWriteReached;
    const drawnDisplayName = getMemberRow().displayName;
    answerWrite();
    await waitForSynchronizedFunctions();

    expect(drawnDisplayName).toBe(user.name);
  });

  // The other fields of the row can change while the write is out. A refusal puts back the display name alone, and
  // Leaves a field the reader did not edit as it now stands
  test("a refused save restores only the display name, not the rest of the member row", async () => {
    expect.hasAssertions();

    const { promise: isWriteReached, resolve: onWriteReached } = Promise.withResolvers<void>();
    const { promise: isWriteRefused, resolve: refuseWrite } = Promise.withResolvers<void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(async () => {
      onWriteReached();
      await isWriteRefused;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountDialog();
    await seedMember();
    await component.get("input").setValue(newDisplayName);
    await component.get("input").trigger("keydown", { key: "Enter" });
    await isWriteReached;
    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser({ ...user, biography: "biography" });
    refuseWrite();
    await waitForSynchronizedFunctions();

    expect(getMemberRow().biography).toBe("biography");
    expect(getMemberRow().displayName).toBe(displayName);
  });
});
