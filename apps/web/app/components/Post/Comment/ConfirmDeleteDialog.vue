<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";
import { useCommentDialogStore } from "@/store/post/comment/dialog";

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
  <UiConfirmDialog
    v-if="comment"
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete comment"
    @confirm="
      async (onComplete) => {
        if (!comment) return;
        // Narrowing does not survive into the closure below, so the id is read out here
        const commentId = comment.id;
        onComplete();
        await deleteComment(commentId, deletingParentId);
      }
    "
  >
    <p>
      {{
        comment.commentCount > 0
          ? "Are you sure you want to delete this comment and its replies?"
          : "Are you sure you want to delete this comment?"
      }}
    </p>
    <PostPreview :post="comment" />
  </UiConfirmDialog>
</template>
