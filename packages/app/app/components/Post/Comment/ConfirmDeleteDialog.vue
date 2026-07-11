<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";
import { useCommentDialogStore } from "@/store/post/comment/dialog";
import { withFinalizerAsync } from "@esposter/shared";

const commentStore = useCommentStore();
const { items } = storeToRefs(commentStore);
const { deleteComment } = commentStore;
const commentDialogStore = useCommentDialogStore();
const { deletingId } = storeToRefs(commentDialogStore);
const comment = computed(() => items.value.find(({ id }) => id === deletingId.value));
const isOpen = useSingletonDialog(deletingId);
</script>

<template>
  <StyledDeleteFormDialog
    v-if="comment"
    v-model="isOpen"
    :card-props="{
      title: 'Delete Comment',
      text: 'Are you sure you want to delete this comment?',
    }"
    @delete="
      async (onComplete) => {
        if (!comment) return;
        const commentId = comment.id;
        await withFinalizerAsync(() => deleteComment(commentId), onComplete);
      }
    "
  >
    <div mx-4 py-2 b-1 b-text rd-lg b-solid shadow-md>
      <PostCommentPreview :comment />
    </div>
  </StyledDeleteFormDialog>
</template>
