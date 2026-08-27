<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";
import { useCommentDialogStore } from "@/store/post/comment/dialog";
import { withFinalizerAsync } from "@esposter/shared";

const commentStore = useCommentStore();
const { deleteComment, getSlice } = commentStore;
const commentDialogStore = useCommentDialogStore();
const { deletingId, deletingParentId } = storeToRefs(commentDialogStore);
// Resolved through the primitive rather than a computed of our own, so a target whose comment has left the
// Tree is dropped with it instead of re-opening this dialog when a later read brings it back
const { isOpen, item: comment } = useSingletonDialog(deletingId, () =>
  getSlice(deletingParentId.value).items.value.find(({ id }) => id === deletingId.value),
);
</script>

<template>
  <StyledDeleteFormDialog
    v-if="comment"
    v-model="isOpen"
    :card-props="{ title: 'Delete Comment' }"
    @delete="
      async (onComplete) => {
        if (!comment) return;
        // Narrowing does not survive into the closure below, so the id is read out here
        const commentId = comment.id;
        await withFinalizerAsync(() => deleteComment(commentId, deletingParentId), onComplete);
      }
    "
  >
    Are you sure you want to delete this comment?
    <StyledPreviewCard>
      <PostPreview :post="comment" />
    </StyledPreviewCard>
  </StyledDeleteFormDialog>
</template>
