<script setup lang="ts">
import { PostSortTypes } from "@/models/post/PostSortType";
import { usePostStore } from "@/store/post";

const { readMorePosts, readPosts } = useReadPosts();
const { refresh } = await readPosts();
const postStore = usePostStore();
const { resetCursorPaginationData } = postStore;
const { hasMore, items, sortType } = storeToRefs(postStore);

watch(sortType, async () => {
  resetCursorPaginationData();
  await refresh();
});
</script>

<template>
  <NuxtLayout>
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
        <v-btn-toggle v-model="sortType" mb-2 density="compact" mandatory>
          <v-btn v-for="postSortType of PostSortTypes" :key="postSortType" :text="postSortType" :value="postSortType" />
        </v-btn-toggle>
        <v-row>
          <v-col v-for="post of items" :key="post.id" cols="12">
            <PostCard :post />
          </v-col>
        </v-row>
        <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMorePosts" />
      </v-container>
    </v-pull-to-refresh>
    <PostConfirmDeleteDialog />
    <template #left>
      <AppProductList />
    </template>
  </NuxtLayout>
</template>
