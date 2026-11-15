<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCommentDialogStore } from "#src/store/post/comment/dialog";

interface Props {
  commentId: string;
}

defineProps<Props>();
const commentDialogStore = useCommentDialogStore();
const { replyingId } = storeToRefs(commentDialogStore);
</script>

<template>
  <UiButton
    :aria-expanded="replyingId === commentId"
    :variant="UiButtonVariant.Quiet"
    @click="replyingId = replyingId === commentId ? '' : commentId"
  >
    <UiIcon :meaning="UiIconMeaning.Reply" />
    Reply
  </UiButton>
</template>
