<script setup lang="ts">
import { POST_SORT_TYPES } from "#src/services/post/constants";
import { getPostSortTypeItems } from "#src/services/post/getPostSortTypeItems";
import { useCommentStore } from "#src/store/post/comment/index";

const commentStore = useCommentStore();
const { commentSortType } = storeToRefs(commentStore);
const { setCommentSortType } = commentStore;
const sortItems = getPostSortTypeItems(POST_SORT_TYPES);
</script>

<template>
  <UiSelect
    :model-value="commentSortType"
    :items="sortItems"
    label="Sort by"
    @update:model-value="(newModelValue) => setCommentSortType(newModelValue)"
  />
</template>
