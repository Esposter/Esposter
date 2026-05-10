<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { useColorsStore } from "@/store/colors";
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
const colorsStore = useColorsStore();
const { text } = storeToRefs(colorsStore);
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
    <div class="custom-border" py-2 mx-4 rd-lg shadow-md>
      <slot name="commentPreview" />
    </div>
  </StyledDeleteFormDialog>
</template>
<!-- @TODO: https://github.com/vuejs/core/issues/7312 -->
<style scoped>
.custom-border {
  border: var(--border-width) var(--border-style) v-bind(text);
}
</style>
