<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface Props {
  image?: RoomInMessage["image"];
  isActive: boolean;
  isBold?: true;
  name: string;
  roomId: RoomInMessage["id"];
}

defineSlots<{ append: (props: { isHovering: boolean }) => VNode }>();
const { image, isActive, isBold, name, roomId } = defineProps<Props>();
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" :active="isActive" :to="RoutePath.Messages(roomId)" :value="roomId">
      <template #prepend>
        <StyledAvatar :image :name />
      </template>
      <v-list-item-title pr-6 :class="isBold ? 'font-weight-bold' : undefined">
        {{ name }}
      </v-list-item-title>
      <template #append>
        <slot name="append" :is-hovering="isHovering ?? false" />
      </template>
    </v-list-item>
  </v-hover>
</template>

<style scoped>
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem;
}
</style>
