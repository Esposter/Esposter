<script setup lang="ts">
import { type StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import { RoutePath } from "@/models/router/RoutePath";
import { usePostStore } from "@/store/post";

interface PostConfirmDeleteDialogProps {
  postId: string;
}

defineSlots<{
  default: (props: StyledDialogActivatorSlotProps) => unknown;
  postPreview: (props: Record<string, never>) => unknown;
}>();
const { postId } = defineProps<PostConfirmDeleteDialogProps>();
const { deletePost } = usePostStore();
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
    <div py-2 mx-4 b-1 b-solid rd-2 shadow-md>
      <slot name="postPreview" />
    </div>
  </StyledDeleteDialog>
</template>
