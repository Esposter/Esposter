<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useCommentStore } from "#src/store/post/comment/index";
import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";

interface Props {
  // The comment being replied to, or the post itself
  parentId: string;
}

defineProps<Props>();
const commentStore = useCommentStore();
const { createComment } = commentStore;
const description = ref("");
</script>

<template>
  <PostDescriptionRichTextEditor v-model="description" height="4rem" placeholder="Add a comment">
    <template #append-footer="{ editor }">
      <UiButton
        v-if="editor"
        :disabled="EMPTY_TEXT_REGEX.test(description)"
        :variant="UiButtonVariant.Accent"
        @click="
          () => {
            // The comment is drawn as it is sent, so the editor clears at once. A refused comment hands its text back,
            // Unless the reader has started another one since
            const submittedDescription = description;
            editor?.commands.clearContent(true);
            createComment({ parentId, description: submittedDescription }, () => {
              if (EMPTY_TEXT_REGEX.test(description))
                editor?.commands.setContent(submittedDescription, { emitUpdate: true });
            });
          }
        "
      >
        Comment
      </UiButton>
    </template>
  </PostDescriptionRichTextEditor>
</template>
