<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { RoutePath } from "@esposter/shared";

interface DirectMessageListItemProps {
  room: RoomInMessage;
}

const { room } = defineProps<DirectMessageListItemProps>();
const directMessageName = useDirectMessageName(() => room);
const directMessageStore = useDirectMessageStore();
const { hideDirectMessage } = directMessageStore;
const { currentDirectMessageId } = storeToRefs(directMessageStore);
const isActive = computed(() => room.id === currentDirectMessageId.value);
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" :active="isActive" :value="room.id" @click="navigateTo(RoutePath.Messages(room.id))">
      <template #prepend>
        <StyledAvatar :name="directMessageName" />
      </template>
      <v-list-item-title pr-6>
        {{ directMessageName }}
      </v-list-item-title>
      <template #append>
        <v-btn
          v-show="isActive || isHovering"
          bg-transparent
          density="compact"
          icon="mdi-close"
          variant="plain"
          size="small"
          :ripple="false"
          @click.stop="hideDirectMessage(room.id)"
        />
      </template>
    </v-list-item>
  </v-hover>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem;
}
</style>
