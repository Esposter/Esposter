<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface ProfileCardMutualRoomsProps {
  mutualRooms: Pick<RoomInMessage, "id" | "image" | "name">[];
}

const { mutualRooms } = defineProps<ProfileCardMutualRoomsProps>();
</script>

<template>
  <template v-if="mutualRooms.length > 0">
    <div text-gray font-semibold uppercase text-label-medium>Mutual Rooms</div>
    <div flex flex-col gap-y-1>
      <v-chip
        v-for="{ id, image, name } of mutualRooms"
        :key="id"
        :to="RoutePath.Messages(id)"
        density="compact"
        size="small"
      >
        <StyledAvatar mr-1 :image :name="name ?? ''" :avatar-props="{ size: '1rem' }" />
        {{ name }}
      </v-chip>
    </div>
  </template>
</template>
