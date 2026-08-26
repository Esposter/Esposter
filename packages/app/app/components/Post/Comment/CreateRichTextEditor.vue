<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface PostCreateCommentRichTextEditorProps {
  // The comment being replied to, or the post itself — a comment is a post, so the composer under a reply and
  // The one under the page are the same editor naming a different parent
  parentId: string;
}

const { parentId } = defineProps<PostCreateCommentRichTextEditorProps>();
const commentStore = useCommentStore();
const { createComment } = commentStore;
const description = ref("");
const commentButtonProps = computed(() => ({ disabled: EMPTY_TEXT_REGEX.test(description.value), text: "Comment" }));
</script>

<template>
  <PostDescriptionRichTextEditor v-model="description" height="4rem" placeholder="Add a comment">
    <template #append-footer="{ editor }">
      <StyledButton
        v-if="editor"
        :button-props="commentButtonProps"
        @click="
          async () => {
            const savedDescription = description;
            editor.commands.clearContent(true);
            await createComment({ parentId, description: savedDescription });
          }
        "
      />
    </template>
  </PostDescriptionRichTextEditor>
</template>
