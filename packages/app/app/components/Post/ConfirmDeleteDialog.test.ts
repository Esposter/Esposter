// @vitest-environment nuxt
import PostConfirmDeleteDialog from "@/components/Post/ConfirmDeleteDialog.vue";
import { createPost } from "@/services/post/createPost.test";
import { usePostStore } from "@/store/post";
import { usePostDialogStore } from "@/store/post/dialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("postConfirmDeleteDialog", () => {
  const id = crypto.randomUUID();

  // Changing the feed's sort re-reads the first page, which drops the targeted post and unmounts this dialog
  // While the target ref stays set — so scrolling that post back in re-opened a delete confirmation over a
  // Post nobody asked to delete
  test("drops the target when its post leaves the feed", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup — the overlay DOM has no bearing on it
    await mountSuspended(PostConfirmDeleteDialog, { shallow: true });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const postDialogStore = usePostDialogStore();
    const { deletingId } = storeToRefs(postDialogStore);
    items.value = [createPost({ id })];
    deletingId.value = id;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(deletingId.value).toBe("");
  });
});
