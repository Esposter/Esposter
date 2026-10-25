<script setup lang="ts">
import { PostFeedSortTypes } from "@/models/post/PostSortType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getPostSortTypeItems } from "@/services/post/getPostSortTypeItems";
import { usePostStore } from "@/store/post";
import { RoutePath } from "@esposter/shared";

const postSortTypeItems = getPostSortTypeItems(PostFeedSortTypes);
const postStore = usePostStore();
const { sortType } = storeToRefs(postStore);
const { resetCursorPaginationData } = postStore;
const { readMorePosts, readPosts } = useReadPosts();
const { isPending, refresh } = await readPosts();

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
    <!-- A sort change empties the feed before it reads again, so the empty state waits for a read that settled -->
    <PostFeed
      empty-description="A post someone creates shows up here."
      :is-pending
      @read-more="(onComplete) => readMorePosts(onComplete)"
    />
  </div>
  <PostConfirmDeleteDialog />
</template>
