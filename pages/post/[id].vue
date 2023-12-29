<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";

const post = await useReadPostFromRoute();
const readMoreComments = await useReadComments(post.id);
const commentStore = useCommentStore();
const { commentList, hasMore } = storeToRefs(commentStore);
</script>

<template>
  <NuxtLayout>
    <v-container h-full flex flex-1 flex-col>
      <v-row flex-none!>
        <v-col>
          <PostCard :post="post" />
        </v-col>
      </v-row>
      <v-row flex-1 flex-col>
        <v-col flex flex-1 flex-col>
          <StyledCard flex-1>
            <v-container>
              <PostAddCommentRichTextEditor :post-id="post.id" />
            </v-container>
            <v-container>
              <PostCommentCard v-for="comment in commentList" :key="comment.id" :comment="comment" />
            </v-container>
          </StyledCard>
        </v-col>
      </v-row>
      <StyledWaypoint :active="hasMore" @change="readMoreComments" />
    </v-container>
  </NuxtLayout>
</template>
