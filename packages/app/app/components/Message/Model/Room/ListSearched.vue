<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { useSearchStore } from "@/store/message/room/search";

const emit = defineEmits<{ "update:room": [] }>();
const searchStore = useSearchStore();
const { readMoreItemsSearched } = searchStore;
const { hasMore, items } = storeToRefs(searchStore);
</script>

<template>
  <v-list>
    <NuxtInvisibleLink
      v-for="{ id, name, image } of items"
      :key="id"
      :to="RoutePath.Messages(id)"
      @click="emit('update:room')"
    >
      <v-list-item :title="name" :value="id">
        <template #prepend>
          <StyledAvatar :image :name />
        </template>
      </v-list-item>
    </NuxtInvisibleLink>
    <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMoreItemsSearched" />
  </v-list>
</template>
