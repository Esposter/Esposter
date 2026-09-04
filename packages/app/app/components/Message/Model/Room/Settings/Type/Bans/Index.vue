<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useBanStore } from "@/store/message/user/ban";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { isPending, readMoreBans, searchQuery } = useReadBans(room.id);
const banStore = useBanStore();
const { hasMore, items } = storeToRefs(banStore);
</script>

<template>
  <div flex flex-col gap-4>
    <v-text-field
      v-model="searchQuery"
      density="compact"
      placeholder="Search bans"
      prepend-inner-icon="mdi-magnify"
      clearable
    />
    <v-list v-if="isPending" lines="two">
      <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </v-list>
    <div v-else-if="items.length === 0" op-medium-emphasis>No banned users.</div>
    <v-list v-else lines="two">
      <MessageModelRoomSettingsTypeBansListItem v-for="ban of items" :key="ban.userId" :ban :room-id="room.id" />
      <StyledWaypoint :is-active="hasMore" @change="readMoreBans" />
    </v-list>
  </div>
</template>
