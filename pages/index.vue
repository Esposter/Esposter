<script setup lang="ts">
import { usePostStore } from "@/store/usePostStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const postStore = usePostStore();
const { pushPostList, updatePostListNextCursor, initialisePostList } = postStore;
const { postList, postListNextCursor } = storeToRefs(postStore);
const hasMore = $computed(() => Boolean(postListNextCursor.value));
const fetchMorePosts = async (onComplete: () => void) => {
  const { posts, nextCursor } = await $client.post.readPosts.query({ cursor: postListNextCursor.value });
  pushPostList(posts);
  updatePostListNextCursor(nextCursor);
  onComplete();
};

const { posts, nextCursor } = await $client.post.readPosts.query({ cursor: null });
initialisePostList(posts);
updatePostListNextCursor(nextCursor);
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col v-for="(post, index) in postList" :key="index" cols="12">
          <PostCard :post="post" />
        </v-col>
      </v-row>
      <VWaypoint :active="hasMore" @change="fetchMorePosts" />
    </v-container>
  </NuxtLayout>
</template>
