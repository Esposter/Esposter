<script setup lang="ts">
import { usePostStore } from "@/store/post";
import { useCommentStore } from "@/store/post/comment";
import { usePostDialogStore } from "@/store/post/dialog";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

const postStore = usePostStore();
const { items } = storeToRefs(postStore);
const { deletePost } = postStore;
const commentStore = useCommentStore();
const { currentPost } = storeToRefs(commentStore);
const postDialogStore = usePostDialogStore();
const { deletingId } = storeToRefs(postDialogStore);
// The comments page renders the current post outside the post list, so fall back to it
const post = computed(
  () =>
    items.value.find(({ id }) => id === deletingId.value) ??
    (currentPost.value?.id === deletingId.value ? currentPost.value : undefined),
);
const isOpen = useSingletonDialog(deletingId);
</script>

<template>
  <StyledDeleteFormDialog
    v-if="post"
    v-model="isOpen"
    :card-props="{
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
    }"
    @delete="
      async (onComplete) => {
        if (!post) return;
        const postId = post.id;
        await withFinalizerAsync(async () => {
          await deletePost(postId);
          await navigateTo(RoutePath.Index);
        }, onComplete);
      }
    "
  >
    <div mx-4 py-2 b-1 b-text rd-lg b-solid shadow-md>
      <PostPreview :post />
    </div>
  </StyledDeleteFormDialog>
</template>
