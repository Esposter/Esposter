<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";

const post = await useReadPostFromRoute();
const readMoreComments = await useReadComments(post.id);
const commentStore = useCommentStore();
const { commentList, hasMore } = storeToRefs(commentStore);
</script>

<template>
  <NuxtLayout>
    <template #left>
      <EsposterProductList />
    </template>
    <v-container>
      <v-row>
        <v-col>
          <PostCard :post="post" />
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="comment in commentList" :key="comment.id" cols="12">
          <PostCard :post="comment" is-comment />
        </v-col>
      </v-row>
      <StyledWaypoint :active="hasMore" @change="readMoreComments" />
    </v-container>
  </NuxtLayout>
</template>
