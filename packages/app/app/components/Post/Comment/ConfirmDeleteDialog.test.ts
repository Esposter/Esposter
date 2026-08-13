// @vitest-environment nuxt
import PostCommentConfirmDeleteDialog from "@/components/Post/Comment/ConfirmDeleteDialog.vue";
import { createPost } from "@/services/post/createPost.test";
import { useCommentStore } from "@/store/post/comment";
import { useCommentDialogStore } from "@/store/post/comment/dialog";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("postCommentConfirmDeleteDialog", () => {
  const id = crypto.randomUUID();
  const postId = crypto.randomUUID();

  // The behaviour matrix for a singleton dialog whose item leaves its list lives in the post dialog's own
  // Test; here only that this dialog resolves through the primitive rather than a computed of its own
  test("drops the target when its comment leaves the list", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup — the overlay DOM has no bearing on it
    await mountSuspended(PostCommentConfirmDeleteDialog, { shallow: true });
    // The comment store keys its list by the post in the route, so a list only exists once one is current
    await navigateTo(RoutePath.Post(postId));
    const commentStore = useCommentStore();
    const { items } = storeToRefs(commentStore);
    const commentDialogStore = useCommentDialogStore();
    const { deletingId } = storeToRefs(commentDialogStore);
    items.value = [createPost({ depth: 1, id, parentId: postId })];
    deletingId.value = id;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(deletingId.value).toBe("");
  });
});
