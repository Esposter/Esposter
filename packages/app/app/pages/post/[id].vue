<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { validate } from "@/services/router/validate";
import { useCommentStore } from "@/store/post/comment";

definePageMeta({ validate });

const { data: session } = await authClient.useSession(useFetch);
const post = await useReadPostFromRoute();
const { readComments, readMoreComments } = useReadComments(post.id);
const { isPending } = await readComments();
const commentStore = useCommentStore();
const { currentPost, hasMore, items } = storeToRefs(commentStore);
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
              <PostCommentCard v-for="comment of items" v-else :key="comment.id" :comment />
            </v-container>
          </StyledCard>
        </v-col>
      </v-row>
      <StyledWaypoint v-if="!isPending" flex justify-center :active="hasMore" @change="readMoreComments" />
    </v-container>
  </NuxtLayout>
</template>
