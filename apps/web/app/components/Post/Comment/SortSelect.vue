<script setup lang="ts">
import { PostSortTypes } from "@/models/post/PostSortType";
import { getPostSortTypeItems } from "@/services/post/getPostSortTypeItems";
import { useCommentStore } from "@/store/post/comment";

const commentStore = useCommentStore();
const { commentSortType } = storeToRefs(commentStore);
const { setCommentSortType } = commentStore;
const sortItems = getPostSortTypeItems(PostSortTypes);
</script>

<template>
  <UiSelect
    :model-value="commentSortType"
    :items="sortItems"
    label="Sort by"
    @update:model-value="setCommentSortType"
  />
</template>
