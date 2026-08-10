// @vitest-environment nuxt
import MessageModelRoomSettingsDialog from "@/components/Message/Model/Room/Settings/Dialog.vue";
import { createRoom } from "@/services/message/room/createRoom.test";
import { useRoomStore } from "@/store/message/room";
import { useDialogStore } from "@/store/message/room/dialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsDialog", () => {
  // The behaviour matrix for a singleton dialog whose item leaves its list lives in useSingletonDialog's own
  // Test; here only that this dialog resolves through the primitive rather than a computed of its own
  test("drops the target when its room leaves the list", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup — the overlay DOM has no bearing on it
    await mountSuspended(MessageModelRoomSettingsDialog, { shallow: true });
    const room = createRoom("name");
    const roomStore = useRoomStore();
    const { pushRooms, storeDeleteRoom } = roomStore;
    const dialogStore = useDialogStore();
    const { settingsRoomId } = storeToRefs(dialogStore);
    pushRooms(room);
    settingsRoomId.value = room.id;
    await flushPromises();
    await storeDeleteRoom({ id: room.id });
    await flushPromises();

    expect(settingsRoomId.value).toBe("");
  });
});
