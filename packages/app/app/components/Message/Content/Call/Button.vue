<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useRoomStore } from "@/store/message/room";
import { mergeProps } from "vue";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const callStore = useCallStore();
const { isConnecting, isInCall } = storeToRefs(callStore);
const { joinCallByRoomId, leaveCall } = callStore;
const roomParticipantMap = useCallRoomParticipantMap();
</script>

<template>
  <v-menu v-if="isInCall" location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom" text="Call">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="mergeProps(menuProps, tooltipProps)" size="small" color="success" variant="text">
            <v-icon icon="mdi-phone" />
            <span ml-1>{{ roomParticipantMap.size }}</span>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <StyledCard>
      <v-list density="compact" min-w-40>
        <v-list-item v-for="{ id, image, isMuted, name } of roomParticipantMap.values()" :key="id" :title="name">
          <template #prepend>
            <StyledAvatar :image :name mr-2 />
          </template>
          <template #append>
            <v-icon v-if="isMuted" icon="mdi-microphone-off" size="small" />
          </template>
        </v-list-item>
        <v-divider />
        <v-list-item prepend-icon="mdi-phone-hangup" title="Leave Call" base-color="error" @click="leaveCall()" />
      </v-list>
    </StyledCard>
  </v-menu>
  <StyledTooltipIconButton
    v-else
    :button-props="{ loading: isConnecting, size: 'small' }"
    icon="mdi-phone"
    text="Start Call"
    :tooltip-props="{ location: 'bottom' }"
    @click="joinCallByRoomId(currentRoomId)"
  />
</template>
