<script setup lang="ts">
import { usePostStore } from "@/store/post";

const postStore = usePostStore();
const { hasMore, items, sortType } = storeToRefs(postStore);
const { resetCursorPaginationData } = postStore;
const { readMorePosts, readPosts } = useReadPosts();
const { refresh } = await readPosts();

watch(sortType, async () => {
  resetCursorPaginationData();
  await refresh();
});
</script>

<template>
  <v-pull-to-refresh
    min-h-16
    @load="
      async ({ done }) => {
        await refresh();
        done();
      }
    "
  >
    <v-container>
      <PostSortMenu />
      <v-divider my-2 />
      <v-row>
        <v-col v-for="post of items" :key="post.id" cols="12">
          <PostCard :post />
        </v-col>
      </v-row>
      <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMorePosts" />
    </v-container>
  </v-pull-to-refresh>
  <PostConfirmDeleteDialog />
</template>
