<script setup lang="ts">
interface PostCommentBranchProps {
  // Distance below the comment the route names, not the stored depth: a rerooted thread opens at zero rather
  // Than already clamped and already indented
  depth: number;
  parentId: string;
}

const { depth, parentId } = defineProps<PostCommentBranchProps>();
const { hasMore, isLoaded, items, readComments, readMoreComments } = useReadComments(parentId);

// The read belongs to the branch rather than to the node above it, so a collapsed branch costs nothing and a
// Re-opened one costs nothing either — its rows are still in the map that outlives this component
if (!isLoaded.value) await readComments();
</script>

<template>
  <PostCommentCard v-for="comment of items" :key="comment.id" :comment :depth />
  <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMoreComments" />
</template>
