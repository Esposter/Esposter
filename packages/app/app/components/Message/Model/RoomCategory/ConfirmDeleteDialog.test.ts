// @vitest-environment nuxt
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import MessageModelRoomCategoryConfirmDeleteDialog from "@/components/Message/Model/RoomCategory/ConfirmDeleteDialog.vue";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { useRoomCategoryDialogStore } from "@/store/message/roomCategoryDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelRoomCategoryConfirmDeleteDialog", () => {
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const name = "name";
  const createCategory = (): RoomCategoryInMessage => ({
    createdAt,
    deletedAt: null,
    id,
    name,
    position: 0,
    updatedAt: createdAt,
    userId,
  });

  // The behaviour matrix for a singleton dialog whose item leaves its list lives in useSingletonDialog's own
  // Test; here only that this dialog resolves through the primitive rather than a computed of its own
  test("drops the target when its category leaves the list", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup, and happy-dom has no visualViewport for
    // The real Vuetify overlay to position itself against
    await mountSuspended(MessageModelRoomCategoryConfirmDeleteDialog, { shallow: true });
    const { categories } = storeToRefs(useRoomCategoryStore());
    const { deletingId } = storeToRefs(useRoomCategoryDialogStore());
    categories.value = [createCategory()];
    deletingId.value = id;
    await flushPromises();
    categories.value = [];
    await flushPromises();

    expect(deletingId.value).toBe("");
  });
});
