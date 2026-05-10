<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface ProfileCardMutualRoomsProps {
  mutualRooms: Pick<RoomInMessage, "id" | "name">[];
}

const { mutualRooms } = defineProps<ProfileCardMutualRoomsProps>();
</script>

<template>
  <template v-if="mutualRooms.length > 0">
    <div text-xs text-gray font-semibold uppercase>Mutual Rooms</div>
    <div flex flex-col gap-y-1>
      <v-chip v-for="{ id, name } of mutualRooms" :key="id" :to="RoutePath.Messages(id)" density="compact" size="small">
        {{ name }}
      </v-chip>
    </div>
  </template>
</template>
