<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomSearchStore } from "@/store/message/room/search";
import { RoutePath } from "@esposter/shared";

const emit = defineEmits<{ "update:room": [] }>();
const roomSearchStore = useRoomSearchStore();
const { readMoreSearchedItems } = roomSearchStore;
const { hasMore, items } = storeToRefs(roomSearchStore);
</script>

<template>
  <v-list>
    <NuxtInvisibleLink
      v-for="{ id, name, image } of items"
      :key="id"
      :to="RoutePath.Messages(id)"
      @click="emit('update:room')"
    >
      <v-list-item :title="name ?? ''" :value="id">
        <template #prepend>
          <StyledAvatar :image :name="name ?? ''" />
        </template>
      </v-list-item>
    </NuxtInvisibleLink>
    <StyledWaypoint :is-active="hasMore" @change="readMoreSearchedItems">
      <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </StyledWaypoint>
  </v-list>
</template>
