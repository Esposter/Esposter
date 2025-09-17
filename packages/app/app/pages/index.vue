<script setup lang="ts">
import { usePostStore } from "@/store/post";

const { readMorePosts, readPosts } = useReadPosts();
const { refresh } = await readPosts();
const postStore = usePostStore();
const { hasMore, items } = storeToRefs(postStore);
</script>

<template>
  <NuxtLayout>
    <v-pull-to-refresh
      @load="
        async ({ done }) => {
          await refresh();
          done();
        }
      "
    >
      <v-container>
        <v-row>
          <v-col v-for="post of items" :key="post.id" cols="12">
            <PostCard :post />
          </v-col>
        </v-row>
        <StyledWaypoint flex justify-center :active="hasMore" @change="readMorePosts" />
      </v-container>
    </v-pull-to-refresh>
    <template #left>
      <AppProductList />
    </template>
  </NuxtLayout>
</template>
