<script setup lang="ts">
interface Props {
  // Distance below the comment the route names, not the stored `depth`: a rerooted thread opens at zero
  depth: number;
  parentId: string;
}

const { depth, parentId } = defineProps<Props>();
const { hasMore, isLoaded, items, readComments, readMoreComments } = useReadComments(parentId);

if (!isLoaded.value) await readComments();
</script>

<template>
  <PostCommentCard v-for="comment of items" :key="comment.id" :comment :depth />
  <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMoreComments" />
</template>
