<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { useCommentStore } from "@/store/post/comment";
import { withFinalizerAsync } from "@esposter/shared";

interface PostCommentConfirmDeleteDialogProps {
  commentId: string;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  commentPreview: () => VNode;
}>();
const { commentId } = defineProps<PostCommentConfirmDeleteDialogProps>();
const commentStore = useCommentStore();
const { deleteComment } = commentStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{
      title: 'Delete Comment',
      text: 'Are you sure you want to delete this comment?',
    }"
    @delete="
      async (onComplete) => {
        await withFinalizerAsync(() => deleteComment(commentId), onComplete);
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <div b-1 b-text rd-lg shadow-md mx-4 py-2>
      <slot name="commentPreview" />
    </div>
  </StyledDeleteFormDialog>
</template>
