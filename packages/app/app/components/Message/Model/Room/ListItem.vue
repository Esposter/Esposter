<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { useDialogStore } from "@/store/message/room/dialog";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { DatabaseEntityType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

interface RoomListItemProps {
  room: RoomInMessage;
}

const { room } = defineProps<RoomListItemProps>();
const { data: session } = await authClient.useSession(useFetch);
const roomName = useRoomName(() => room.id);
const inputStore = useInputStore();
const { drafts } = storeToRefs(inputStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const isActive = computed(() => room.id === currentRoomId.value);
const hasDraft = computed(() => drafts.value.has(room.id) && room.id !== currentRoomId.value);
const isCreator = computed(() => room.userId === session.value?.user.id);
const roleStore = useRoleStore();
const { checkIsManageable } = roleStore;
const dialogStore = useDialogStore();
const { settingsRoomId } = storeToRefs(dialogStore);
const isVisible = computed(() => isCreator.value || checkIsManageable(room.id));
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
      <v-list-item-title pr-6 :class="hasUnread || hasDraft ? 'font-weight-bold' : undefined">
        {{ roomName }}
      </v-list-item-title>
      <template #append>
        <v-tooltip v-if="hasDraft" text="Draft" location="top">
          <template #activator="{ props: activatorProps }">
            <v-icon :="activatorProps" icon="mdi-pencil" size="x-small" op-medium-emphasis />
          </template>
        </v-tooltip>
        <v-tooltip v-if="room.isReadOnly" text="Read-only" location="top">
          <template #activator="{ props: activatorProps }">
            <v-icon :="activatorProps" icon="mdi-bullhorn-outline" size="x-small" op-medium-emphasis />
          </template>
        </v-tooltip>
        <v-tooltip :text="`${DatabaseEntityType.Room} Settings`">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-show="(isActive || isHovering) && isVisible"
              bg-transparent
              :="tooltipProps"
              :ripple="false"
              density="compact"
              icon="mdi-cog"
              variant="plain"
              size="small"
              @click.stop="settingsRoomId = room.id"
            />
          </template>
        </v-tooltip>
      </template>
    </v-list-item>
  </v-hover>
</template>

<style scoped>
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem;
}
</style>
