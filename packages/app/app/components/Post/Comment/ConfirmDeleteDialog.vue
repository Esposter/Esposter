<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { useCommentStore } from "@/store/post/comment";

interface PostCommentConfirmDeleteDialogProps {
  commentId: string;
}

defineSlots<{
  commentPreview: () => VNode;
  default: (props: StyledDialogActivatorSlotProps) => VNode;
}>();
const { commentId } = defineProps<PostCommentConfirmDeleteDialogProps>();
const commentStore = useCommentStore();
const { deleteComment } = commentStore;
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
    <div class="custom-border" py-2 mx-4 rd-lg shadow-md>
      <slot name="commentPreview" />
    </div>
  </StyledDeleteDialog>
</template>
<!-- @TODO: https://github.com/vuejs/core/issues/7312 -->
<style scoped lang="scss">
.custom-border {
  border: $border-width-root $border-style-root v-bind(text);
}
</style>
