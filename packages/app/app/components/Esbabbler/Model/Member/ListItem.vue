<script setup lang="ts">
import type { User } from "#shared/db/schema/users";

import { UserStatus } from "#shared/models/db/user/UserStatus";
import { StatusBadgePropsMap } from "@/services/esbabbler/StatusBadgePropsMap";
import { useRoomStore } from "@/store/esbabbler/room";
import { useUserStatusStore } from "@/store/esbabbler/userStatus";

interface MemberListItemProps {
  member: User;
}

const { member } = defineProps<MemberListItemProps>();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === member.id);
const userStatusStore = useUserStatusStore();
const { userStatusMap } = storeToRefs(userStatusStore);
const badgeProps = computed(() => {
  const userStatus = userStatusMap.value.get(member.id);
  return StatusBadgePropsMap[userStatus?.status ?? UserStatus.Online];
});
</script>

<template>
  <v-list-item :value="member.name">
    <template #prepend>
      <v-badge location="bottom end" dot :="badgeProps">
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
