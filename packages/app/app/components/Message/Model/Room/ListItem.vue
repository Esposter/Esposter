<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { RoutePath } from "@esposter/shared";

interface RoomListItemProps {
  room: Room;
}

const { room } = defineProps<RoomListItemProps>();
const roomName = useRoomName(() => room.id);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const isActive = computed(() => room.id === currentRoomId.value);
const session = authClient.useSession();
const isCreator = computed(() => room.userId === session.value.data?.user.id);
const roleStore = useRoleStore();
const { isManageable } = roleStore;
const showSettings = computed(() => isCreator.value || isManageable(room.id));
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" :active="isActive" :value="room.id" @click="navigateTo(RoutePath.Messages(room.id))">
      <template #prepend>
        <StyledAvatar :image="room.image" :name="roomName" />
      </template>
      <v-list-item-title pr-6>
        {{ roomName }}
      </v-list-item-title>
      <template #append>
        <MessageModelRoomSettingsDialogButton :room-id="room.id">
          <template #activator="activatorProps">
            <v-btn
              v-show="(isActive || isHovering) && showSettings"
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
