<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { RoutePath } from "#shared/models/router/RoutePath";
import { usePostStore } from "@/store/post";

interface PostConfirmDeleteDialogProps {
  postId: string;
}

defineSlots<{
  default: (props: StyledDialogActivatorSlotProps) => unknown;
  postPreview: (props: Record<string, never>) => unknown;
}>();
const { postId } = defineProps<PostConfirmDeleteDialogProps>();
const postStore = usePostStore();
const { deletePost } = postStore;
const { text } = useColors();
</script>

<template>
  <StyledDeleteDialog
    :card-props="{
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
    }"
    @delete="
      async (onComplete) => {
        try {
          await deletePost(postId);
          await navigateTo(RoutePath.Index);
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
      <slot name="postPreview" />
    </div>
  </StyledDeleteDialog>
</template>

<style scoped lang="scss">
.custom-border {
  border: 1px $border-style-root v-bind(text);
}
</style>
