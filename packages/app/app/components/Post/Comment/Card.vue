<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useCommentDialogStore } from "@/store/post/comment/dialog";

interface PostCommentCardProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostCommentCardProps>();
const { data: session } = await authClient.useSession(useFetch);
const commentDialogStore = useCommentDialogStore();
const { deletingId } = storeToRefs(commentDialogStore);
const isCreator = computed(() => comment.userId === session.value?.user.id);
const isUpdateMode = ref(false);
</script>

<template>
  <div flex>
    <PostLikeSection :post="comment" is-comment-store pt-2 />
    <v-card px-2 pt-2 flex-1 shadow-none>
      <PostByline is-link :post="comment" />
      <PostCommentUpdateRichTextEditor
        v-if="isUpdateMode"
        mt-2
        :comment
        @update:update-mode="isUpdateMode = $event"
        @update:delete-mode="deletingId = comment.id"
      />
      <PostDescription v-else :description="comment.description" />
      <v-card-actions p-0>
        <PostCommentUpdateButton v-if="isCreator" @update:update-mode="isUpdateMode = $event" />
        <PostCommentDeleteButton v-if="isCreator" @update:delete-mode="deletingId = comment.id" />
      </v-card-actions>
    </v-card>
  </div>
</template>
