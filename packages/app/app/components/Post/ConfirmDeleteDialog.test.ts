// @vitest-environment nuxt
import type { PostWithRelations } from "@esposter/db-schema";

import PostConfirmDeleteDialog from "@/components/Post/ConfirmDeleteDialog.vue";
import { usePostStore } from "@/store/post";
import { usePostDialogStore } from "@/store/post/dialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("postConfirmDeleteDialog", () => {
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const name = "name";
  const createPost = (): PostWithRelations => ({
    createdAt,
    deletedAt: null,
    depth: 0,
    description: "",
    id,
    noComments: 0,
    noLikes: 0,
    parentId: null,
    ranking: 0,
    title: "",
    updatedAt: createdAt,
    user: {
      biography: "",
      createdAt,
      deletedAt: null,
      email: "",
      emailVerified: true,
      id: userId,
      image: "",
      name,
      updatedAt: createdAt,
    },
    userId,
  });

  // Changing the feed's sort re-reads the first page, which drops the targeted post and unmounts this dialog
  // While the target ref stays set — so scrolling that post back in re-opened a delete confirmation over a
  // Post nobody asked to delete
  test("drops the target when its post leaves the feed", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup, and happy-dom has no visualViewport for
    // The real Vuetify overlay to position itself against
    await mountSuspended(PostConfirmDeleteDialog, { shallow: true });
    const { items } = storeToRefs(usePostStore());
    const { deletingId } = storeToRefs(usePostDialogStore());
    items.value = [createPost()];
    deletingId.value = id;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(deletingId.value).toBe("");
  });
});
