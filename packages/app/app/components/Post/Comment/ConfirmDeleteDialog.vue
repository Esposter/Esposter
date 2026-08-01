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
const { isOpen } = useSingletonDialog(deletingId);
</script>

<template>
  <StyledDeleteFormDialog
    v-if="comment"
    v-model="isOpen"
    :card-props="{ title: 'Delete Comment' }"
    @delete="
      async (onComplete) => {
        if (!comment) return;
        const commentId = comment.id;
        await withFinalizerAsync(() => deleteComment(commentId), onComplete);
      }
    "
  >
    Are you sure you want to delete this comment?
    <StyledPreviewCard>
      <PostPreview :post="comment" />
    </StyledPreviewCard>
  </StyledDeleteFormDialog>
</template>
