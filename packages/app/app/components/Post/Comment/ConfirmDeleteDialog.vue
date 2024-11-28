<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { useCommentStore } from "@/store/post/comment";

interface PostCommentConfirmDeleteDialogProps {
  commentId: string;
}

defineSlots<{
  commentPreview: (props: Record<string, never>) => unknown;
  default: (props: StyledDialogActivatorSlotProps) => unknown;
}>();
const { commentId } = defineProps<PostCommentConfirmDeleteDialogProps>();
const { deleteComment } = useCommentStore();
const { text } = useColors();
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
    <div class="border" py-2 mx-4 rd-lg shadow-md>
      <slot name="commentPreview" />
    </div>
  </StyledDeleteDialog>
</template>

<style scoped lang="scss">
.border {
  border: 1px $border-style-root v-bind(text);
}
</style>
