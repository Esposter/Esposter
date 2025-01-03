<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { validate } from "@/services/router/validate";
import { useCommentStore } from "@/store/post/comment";

definePageMeta({ validate });

const post = await useReadPostFromRoute();
const readMoreComments = await useReadComments(post.id);
const { data: session } = await authClient.useSession(useFetch);
const commentStore = useCommentStore();
const { commentList, currentPost, hasMore } = storeToRefs(commentStore);
currentPost.value = post;
</script>

<template>
  <NuxtLayout>
    <v-container v-if="currentPost" h-full flex flex-col flex-1>
      <v-row flex-none="!">
        <v-col>
          <PostCard :post="currentPost" is-comment-store />
        </v-col>
      </v-row>
      <v-row flex-1 flex-col>
        <v-col flex flex-1 flex-col>
          <StyledCard flex-1>
            <v-container v-if="session">
              <PostCommentCreateRichTextEditor :post-id="currentPost.id" />
            </v-container>
            <v-container>
              <PostCommentEmptyBanner v-if="currentPost.noComments === 0" />
              <PostCommentCard v-for="comment of commentList" v-else :key="comment.id" :comment />
            </v-container>
          </StyledCard>
        </v-col>
      </v-row>
      <StyledWaypoint :active="hasMore" @change="readMoreComments" />
    </v-container>
  </NuxtLayout>
</template>
