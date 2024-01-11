<script setup lang="ts">
import { type StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import { useCommentStore } from "@/store/post/comment";

interface PostCommentConfirmDeleteDialogProps {
  commentId: string;
}

defineSlots<{
  default: (props: StyledDialogActivatorSlotProps) => unknown;
  commentPreview: (props: Record<string, never>) => unknown;
}>();
const { commentId } = defineProps<PostCommentConfirmDeleteDialogProps>();
const { deleteComment } = useCommentStore();
</script>

<template>
  <StyledDeleteDialog
    :card-props="{
      title: 'Delete Comment',
      text: 'Are you sure you want to delete this comment?',
    }"
    @delete="
      async (onComplete) => {
        try {
          await deleteComment(commentId);
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="activatorProps">
      <slot :="activatorProps" />
    </template>
    <div py-2 mx-4 b-1 b-solid rd-2 shadow-md>
      <slot name="commentPreview" />
    </div>
  </StyledDeleteDialog>
</template>
