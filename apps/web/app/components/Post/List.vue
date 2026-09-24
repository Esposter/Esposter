<script setup lang="ts">
import { PostSortTypes } from "@/models/post/PostSortType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PostSortTypeIconMeaningMap } from "@/services/post/PostSortTypeIconMeaningMap";
import { usePostStore } from "@/store/post";
import { RoutePath } from "@esposter/shared";

const postSortTypeItems = PostSortTypes.map((postSortType) => ({
  meaning: PostSortTypeIconMeaningMap[postSortType],
  title: postSortType,
  value: postSortType,
}));
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
  <!-- Pulling to refresh is the browser's own, which reloads the feed -->
  <div px-4 py-6 flex flex-col gap-4 w-full ui-body>
    <!-- Reddit's own arrangement: the feed is where someone reads a post and decides to write one, so the
      Create action sits on the feed's own toolbar rather than only in the launcher, which a reader opens to leave
      Posts rather than to write one -->
    <div flex gap-2 items-center>
      <UiSelect v-model="sortType" :items="postSortTypeItems" label="Sort by" />
      <div flex-1 />
      <UiButtonLink :to="RoutePath.PostCreate" :variant="UiButtonVariant.Accent">
        <UiIcon :meaning="UiIconMeaning.Create" />
        Create post
      </UiButtonLink>
    </div>
    <PostCard v-for="post of items" :key="post.id" :post />
    <UiEmptyState
      v-if="items.length === 0"
      description="A post someone creates shows up here."
      :meaning="UiIconMeaning.Comment"
      title="Nothing posted yet"
    />
    <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMorePosts" />
  </div>
  <PostConfirmDeleteDialog />
</template>
