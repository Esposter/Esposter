<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { useColorsStore } from "@/store/colors";
import { usePostStore } from "@/store/post";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

interface PostConfirmDeleteDialogProps {
  postId: string;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  postPreview: () => VNode;
}>();
const { postId } = defineProps<PostConfirmDeleteDialogProps>();
const postStore = usePostStore();
const { deletePost } = postStore;
const colorsStore = useColorsStore();
const { text } = storeToRefs(colorsStore);
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
    }"
    @delete="
      async (onComplete) => {
        await withFinalizerAsync(async () => {
          await deletePost(postId);
          await navigateTo(RoutePath.Index);
        }, onComplete);
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <div class="custom-border" py-2 mx-4 rd-lg shadow-md>
      <slot name="postPreview" />
    </div>
  </StyledDeleteFormDialog>
</template>
<!-- @TODO: https://github.com/vuejs/core/issues/7312 -->
<style scoped>
.custom-border {
  border: var(--border-width) var(--border-style) v-bind(text);
}
</style>
