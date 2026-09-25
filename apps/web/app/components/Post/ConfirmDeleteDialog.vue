<script setup lang="ts">
import { usePostStore } from "@/store/post";
import { useCommentStore } from "@/store/post/comment";
import { usePostDialogStore } from "@/store/post/dialog";
import { RoutePath } from "@esposter/shared";

const postStore = usePostStore();
const { items } = storeToRefs(postStore);
const { deletePost } = postStore;
const commentStore = useCommentStore();
const { currentPost } = storeToRefs(commentStore);
const postDialogStore = usePostDialogStore();
const { deletingId } = storeToRefs(postDialogStore);
// Resolved through the primitive rather than a computed of our own, so a target whose post has left the feed
// (a sort change re-reads the first page) is dropped with it instead of re-opening this dialog by itself as
// Soon as scrolling pages that post back in.
// The comments page renders the current post outside the post list, so fall back to it
const { isOpen, item: post } = useSingletonDialog(
  deletingId,
  () =>
    items.value.find(({ id }) => id === deletingId.value) ??
    (currentPost.value?.id === deletingId.value ? currentPost.value : undefined),
);
</script>

<template>
  <UiConfirmDialog
    v-if="post"
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete post"
    is-optimistic
    :confirm="
      async () => {
        if (!post) return;
        const postId = post.id;
        await deletePost(postId);
        await navigateTo(RoutePath.Index);
      }
    "
  >
    <p>Are you sure you want to delete this post?</p>
    <PostPreview :post />
  </UiConfirmDialog>
</template>
