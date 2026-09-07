<script setup lang="ts">
import { PostSortTypes } from "@/models/post/PostSortType";
import { PostSortTypeIconMap } from "@/services/post/PostSortTypeIconMap";
import { usePostStore } from "@/store/post";

const postStore = usePostStore();
const { sortType } = storeToRefs(postStore);
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-btn
        rd-full
        append-icon="mdi-menu-down"
        size="small"
        :prepend-icon="PostSortTypeIconMap[sortType]"
        :text="sortType"
        :="menuProps"
      />
    </template>
    <v-list density="compact">
      <v-list-subheader>Sort by</v-list-subheader>
      <v-list-item
        v-for="postSortType of PostSortTypes"
        :key="postSortType"
        :active="postSortType === sortType"
        color="primary"
        :prepend-icon="PostSortTypeIconMap[postSortType]"
        :title="postSortType"
        @click="sortType = postSortType"
      />
    </v-list>
  </v-menu>
</template>
