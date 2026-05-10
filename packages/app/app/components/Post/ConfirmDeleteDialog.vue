<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

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
    <div b-1 rd-lg b-solid shadow-md mx-4 py-2 b-text>
      <slot name="postPreview" />
    </div>
  </StyledDeleteFormDialog>
</template>
