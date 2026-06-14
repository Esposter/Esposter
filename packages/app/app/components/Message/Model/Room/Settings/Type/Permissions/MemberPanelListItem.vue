<script setup lang="ts">
import type { RoomInMessage, User } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface MemberPanelListItemProps {
  active: boolean;
  member: User;
  roomId: RoomInMessage["id"];
}

const { active, member, roomId } = defineProps<MemberPanelListItemProps>();
const emit = defineEmits<{ click: [] }>();
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
const displayName = computed(() => getDisplayName(member, roomId));
</script>

<template>
  <v-list-item :active @click="emit('click')">
    <template #prepend>
      <StyledAvatar :image="member.image" :name="displayName" mr-2 />
    </template>
    <v-list-item-title>{{ displayName }}</v-list-item-title>
  </v-list-item>
</template>
