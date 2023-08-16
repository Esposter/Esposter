<script setup lang="ts">
import { usePostStore } from "@/store/post";

const readMorePosts = await useReadPosts();
const postStore = usePostStore();
const { postList, postListNextCursor } = storeToRefs(postStore);
const hasMore = computed(() => Boolean(postListNextCursor.value));
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
      <VWaypoint :active="hasMore" @change="readMorePosts" />
    </v-container>
  </NuxtLayout>
</template>
