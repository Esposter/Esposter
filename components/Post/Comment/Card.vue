<script setup lang="ts">
import { type PostWithRelations } from "@/db/schema/posts";
import dayjs from "dayjs";

interface PostCommentCardProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostCommentCardProps>();
const { session } = useAuth();
const createdAt = computed(() => dayjs(comment.createdAt).fromNow());
const isOwner = computed(() => session.value?.user.id === comment.creatorId);
</script>

<template>
  <div flex>
    <PostLikeSection :post="comment" />
    <v-card px-2="!" pt-2="!" shadow-none="!">
      <v-avatar>
        <v-img v-if="comment.creator.image" :src="comment.creator.image" />
      </v-avatar>
      Posted by <span font-bold>{{ comment.creator.name }}</span> <span class="text-grey">{{ createdAt }}</span>
      <v-card-text class="text-subtitle-1 card-content" px-0="!" pb-0="!" v-html="comment.description" />
      <v-card-actions p-0="!">
        <PostCommentConfirmDeleteDialogButton v-if="isOwner" :comment-id="comment.id" is-comment />
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped lang="scss">
:deep(.card-content) {
  ul,
  ol {
    padding: 0 1rem;
  }
}
</style>
