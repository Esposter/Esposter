<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useCommentStore } from "@/store/post/comment";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface Props {
  // The comment being replied to, or the post itself
  parentId: string;
}

const { parentId } = defineProps<Props>();
const commentStore = useCommentStore();
const { isCreateCommentPending } = storeToRefs(commentStore);
const { createComment } = commentStore;
const description = ref("");
</script>

<template>
  <PostDescriptionRichTextEditor v-model="description" height="4rem" placeholder="Add a comment">
    <template #append-footer="{ editor }">
      <UiButton
        v-if="editor"
        :disabled="EMPTY_TEXT_REGEX.test(description)"
        :is-pending="isCreateCommentPending"
        :variant="UiButtonVariant.Accent"
        @click="
          async () => {
            // The editor stays live while the comment is pending, so text typed meanwhile is not the comment's to clear
            const submittedDescription = description;
            if (
              (await createComment({ parentId, description: submittedDescription })) &&
              description === submittedDescription
            )
              editor.commands.clearContent(true);
          }
        "
      >
        Comment
      </UiButton>
    </template>
  </PostDescriptionRichTextEditor>
</template>
