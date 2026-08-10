// @vitest-environment nuxt
import type { PostWithRelations } from "@esposter/db-schema";

import PostCommentConfirmDeleteDialog from "@/components/Post/Comment/ConfirmDeleteDialog.vue";
import { useCommentStore } from "@/store/post/comment";
import { useCommentDialogStore } from "@/store/post/comment/dialog";
import { StorageTier } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("postCommentConfirmDeleteDialog", () => {
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const postId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const name = "name";
  const createComment = (): PostWithRelations => ({
    createdAt,
    deletedAt: null,
    depth: 1,
    description: "",
    id,
    noComments: 0,
    noLikes: 0,
    parentId: postId,
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
      storageBytesUsed: 0,
      storageTier: StorageTier.Free,
      updatedAt: createdAt,
    },
    userId,
  });

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
    items.value = [createComment()];
    deletingId.value = id;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(deletingId.value).toBe("");
  });
});
