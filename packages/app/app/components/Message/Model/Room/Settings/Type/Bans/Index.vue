<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useBanStore } from "@/store/message/user/ban";

interface BansProps {
  room: RoomInMessage;
}

const { room } = defineProps<BansProps>();
const { readBans, readMoreBans } = useReadBans(room.id);
const banStore = useBanStore();
const { hasMore, items } = storeToRefs(banStore);

await readBans();
</script>

<template>
  <div flex flex-col gap-4>
    <div v-if="items.length === 0" op-medium-emphasis>No banned users.</div>
    <v-list v-else lines="two">
      <MessageModelRoomSettingsTypeBansListItem v-for="ban of items" :key="ban.userId" :ban :room-id="room.id" />
      <StyledWaypoint :is-active="hasMore" @change="readMoreBans" />
    </v-list>
  </div>
</template>
