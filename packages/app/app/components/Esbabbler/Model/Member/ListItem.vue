<script setup lang="ts">
import type { User } from "#shared/db/schema/users";

import { useRoomStore } from "@/store/esbabbler/room";

interface MemberListItemProps {
  member: User;
}

const { member } = defineProps<MemberListItemProps>();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === member.id);
</script>

<template>
  <v-list-item :value="member.name">
    <template #prepend>
      <v-badge color="green" location="bottom end" dot>
        <StyledAvatar :image="member.image" :name="member.name" />
      </v-badge>
    </template>
    <v-list-item-title>
      <div flex items-center gap-x-1>
        {{ member.name }}
        <v-tooltip v-if="isCreator" text="Room Owner">
          <template #activator="{ props }">
            <v-icon icon="mdi-crown" :="props" color="yellow-darken-4" />
          </template>
        </v-tooltip>
      </div>
    </v-list-item-title>
  </v-list-item>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem !important;
}
</style>
