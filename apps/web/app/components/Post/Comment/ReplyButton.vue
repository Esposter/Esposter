<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCommentDialogStore } from "@/store/post/comment/dialog";

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
