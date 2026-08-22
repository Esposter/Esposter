<script setup lang="ts">
import { usePostStore } from "@/store/post";
import { RoutePath } from "@esposter/shared";

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
      <!-- Reddit's own arrangement: the feed is where someone reads a post and decides to write one, so the
        Create action sits on the feed's own toolbar rather than only in the apps menu, which is a product
        switcher a reader opens to leave posts rather than to write one -->
      <div flex gap-x-2 items-center>
        <PostSortMenu />
        <v-spacer />
        <StyledButton
          :button-props="{
            prependIcon: 'mdi-square-edit-outline',
            size: 'small',
            text: 'Create Post',
            to: RoutePath.PostCreate,
          }"
        />
      </div>
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
