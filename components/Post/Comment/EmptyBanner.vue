<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";

const post = await useReadPostFromRoute();
const readMoreComments = await useReadComments(post.id);
const { status } = useAuth();
const commentStore = useCommentStore();
const { currentPost, commentList, hasMore } = storeToRefs(commentStore);
currentPost.value = post;
</script>

<template>
  <div flex flex-col>
    <div class="text-h6" font-bold>Be the first to comment</div>
    <div class="text-subtitle-1 text-grey" pt-2>Nobody's responded to this post yet.</div>
    <div class="text-subtitle-1 text-grey">Add your thoughts and get the conversation going.</div>
  </div>
</template>
