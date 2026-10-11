<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { POST_SKELETON_COUNT } from "@/services/post/constants";
import { usePostStore } from "@/store/post";

interface Props {
  emptyDescription: string;
  isPending: boolean;
}

const { emptyDescription, isPending } = defineProps<Props>();
const emit = defineEmits<{ readMore: [onComplete: () => void] }>();
const postStore = usePostStore();
const { hasMore, items } = storeToRefs(postStore);
</script>

<!-- The posts of a feed, shared by the home feed and a profile: a skeleton while the first page is in flight, the empty
     state once it settled with nothing, and a waypoint that reads the next page as it comes into view -->
<template>
  <div v-if="isPending && items.length === 0" aria-busy="true" flex flex-col gap-4>
    <PostCardSkeleton v-for="index of POST_SKELETON_COUNT" :key="index" />
  </div>
  <PostCard v-for="post of items" :key="post.id" :post />
  <UiEmptyState
    v-if="!isPending && items.length === 0"
    :description="emptyDescription"
    :meaning="UiIconMeaning.Comment"
    title="Nothing posted yet"
  />
  <StyledWaypoint flex justify-center :is-active="hasMore" @change="(onComplete) => emit('readMore', onComplete)" />
</template>
