// @vitest-environment nuxt
import MessageModelRoomCategoryConfirmDeleteDialog from "@/components/Message/Model/RoomCategory/ConfirmDeleteDialog.vue";
import { createRoomCategory } from "@/services/message/roomCategory/createRoomCategory.test";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { useRoomCategoryDialogStore } from "@/store/message/roomCategoryDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelRoomCategoryConfirmDeleteDialog", () => {
  const id = crypto.randomUUID();

  // The behaviour matrix for a singleton dialog whose item leaves its list lives in useSingletonDialog's own
  // Test; here only that this dialog resolves through the primitive rather than a computed of its own
  test("drops the target when its category leaves the list", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup — the overlay DOM has no bearing on it
    await mountSuspended(MessageModelRoomCategoryConfirmDeleteDialog, { shallow: true });
    const roomCategoryStore = useRoomCategoryStore();
    const { categories } = storeToRefs(roomCategoryStore);
    const roomCategoryDialogStore = useRoomCategoryDialogStore();
    const { deletingId } = storeToRefs(roomCategoryDialogStore);
    categories.value = [createRoomCategory({ id })];
    deletingId.value = id;
    await flushPromises();
    categories.value = [];
    await flushPromises();

    expect(deletingId.value).toBe("");
  });
});
