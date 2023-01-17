<script setup lang="ts">
import { usePostStore } from "@/store/usePostStore";

const { $client } = useNuxtApp();
const postStore = usePostStore();
const { pushPostList, updatePostListNextCursor, initialisePostList } = postStore;
const { postList, postListNextCursor } = $(storeToRefs(postStore));
const hasMore = $computed(() => Boolean(postListNextCursor));
const fetchMorePosts = async (onComplete: () => void) => {
  try {
    const { posts, nextCursor } = await $client.post.readPosts.query({ cursor: postListNextCursor });
    pushPostList(posts);
    updatePostListNextCursor(nextCursor);
  } finally {
    onComplete();
  }
};

const { posts, nextCursor } = await $client.post.readPosts.query({ cursor: null });
initialisePostList(posts);
updatePostListNextCursor(nextCursor);
</script>

<template>
  <NuxtLayout>
    <template #left>
      <EsposterProductList />
    </template>
    <v-container>
      <v-row>
        <v-col v-for="post in postList" :key="post.id" cols="12">
          <PostCard :post="post" />
        </v-col>
      </v-row>
      <VWaypoint :active="hasMore" @change="fetchMorePosts" />
    </v-container>
  </NuxtLayout>
</template>
