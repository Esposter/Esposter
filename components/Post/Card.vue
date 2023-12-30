<script setup lang="ts">
import { type PostWithRelations } from "@/db/schema/posts";
import { EMPTY_TEXT_REGEX } from "@/util/text";
import dayjs from "dayjs";

interface PostCardProps {
  post: PostWithRelations;
  // This is only used for the post card in the comments page to direct it
  // into looking for post data in the comment store instead
  isCommentStore?: true;
}

const { post, isCommentStore } = defineProps<PostCardProps>();
const { session } = useAuth();
const { surfaceOpacity80 } = useColors();
const createdAt = computed(() => dayjs(post.createdAt).fromNow());
const isCreator = computed(() => session.value?.user.id === post.creatorId);
const isEmptyDescription = computed(() => EMPTY_TEXT_REGEX.test(post.description));
</script>

<template>
  <PostConfirmDeleteDialog :post-id="post.id">
    <template #default="{ updateIsOpen }">
      <StyledCard class="card">
        <PostLikeSection absolute top-2 left-2 :post="post" :is-comment-store="isCommentStore" />
        <v-card px-2="!" pt-2="!">
          <v-avatar>
            <v-img v-if="post.creator.image" :src="post.creator.image" />
          </v-avatar>
          Posted by <span font-bold>{{ post.creator.name }}</span> <span class="text-grey">{{ createdAt }}</span>
          <v-card-title class="text-h6" px-0="!" font-bold="!" whitespace="normal!">
            {{ post.title }}
          </v-card-title>
          <v-card-text
            v-if="!isEmptyDescription"
            class="text-subtitle-1 card-content"
            px-0="!"
            pb-0="!"
            v-html="post.description"
          />
          <v-card-actions p-0="!">
            <PostCommentsButton :post="post" />
            <PostUpdateButton v-if="isCreator" :post-id="post.id" />
            <PostDeleteButton v-if="isCreator" @update:delete-mode="updateIsOpen" />
          </v-card-actions>
        </v-card>
      </StyledCard>
    </template>
    <template #postPreview>
      <v-card px-2="!" shadow-none="!">
        <v-avatar>
          <v-img v-if="post.creator.image" :src="post.creator.image" />
        </v-avatar>
        Posted by <span font-bold>{{ post.creator.name }}</span> <span class="text-grey">{{ createdAt }}</span>
        <v-card-title class="text-h6" px-0="!" font-bold="!" whitespace="normal!">
          {{ post.title }}
        </v-card-title>
        <v-card-text
          v-if="!isEmptyDescription"
          class="text-subtitle-1 card-content"
          px-0="!"
          pb-0="!"
          v-html="post.description"
        />
      </v-card>
    </template>
  </PostConfirmDeleteDialog>
</template>

<style scoped lang="scss">
.card {
  padding-left: 2.5rem;
  background-color: v-bind(surfaceOpacity80);
}

:deep(.card-content) {
  ul,
  ol {
    padding: 0 1rem;
  }
}
</style>
