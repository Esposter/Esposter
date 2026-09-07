<script setup lang="ts">
import { DEFAULT_NAME } from "#shared/services/constants";
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { createRoom } = roomStore;
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ ripple: false, size: 'small' }"
    icon="mdi-plus"
    text="Create Room"
    @click.stop="createRoom({ name: DEFAULT_NAME })"
  />
</template>
