<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { RoutePath } from "@esposter/shared";

interface RoomListItemProps {
  room: RoomInMessage;
}

const { room } = defineProps<RoomListItemProps>();
const { data: session } = await authClient.useSession(useFetch);
const roomName = useRoomName(() => room.id);
const inputStore = useInputStore();
const { draftRoomIds } = storeToRefs(inputStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const isActive = computed(() => room.id === currentRoomId.value);
const hasDraft = computed(() => draftRoomIds.value.has(room.id) && room.id !== currentRoomId.value);
const isCreator = computed(() => room.userId === session.value?.user.id);
const roleStore = useRoleStore();
const { isManageable } = roleStore;
const isVisible = computed(() => isCreator.value || isManageable(room.id));
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom } = userToRoomStore;
const hasUnread = computed(() => {
  if (isActive.value) return false;
  const lastMessageAt = getMyUserToRoom(room.id)?.lastMessageAt;
  return lastMessageAt && lastMessageAt < room.updatedAt;
});
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" :active="isActive" :value="room.id" @click="navigateTo(RoutePath.Messages(room.id))">
      <template #prepend>
        <StyledAvatar :image="room.image" :name="roomName" />
      </template>
      <v-list-item-title pr-6 :class="hasUnread ? 'font-weight-bold' : undefined">
        {{ roomName }}
        <span v-if="hasDraft" class="text-medium-emphasis" text-xs italic> — Draft</span>
      </v-list-item-title>
      <template #append>
        <v-tooltip v-if="room.isReadOnly" text="Read-only" location="top">
          <template #activator="{ props: activatorProps }">
            <v-icon :="activatorProps" icon="mdi-bullhorn-outline" size="x-small" class="text-medium-emphasis" />
          </template>
        </v-tooltip>
        <MessageModelRoomSettingsDialogButton :room-id="room.id">
          <template #activator="activatorProps">
            <v-btn
              v-show="(isActive || isHovering) && isVisible"
              bg-transparent
              :="activatorProps"
              :ripple="false"
              density="compact"
              icon="mdi-cog"
              variant="plain"
              size="small"
            />
          </template>
        </MessageModelRoomSettingsDialogButton>
      </template>
    </v-list-item>
  </v-hover>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem;
}
</style>
