<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";

interface MessageModelRoomBaseListProps {
  hasMore: boolean;
  isPending: boolean;
}

defineSlots<{ default: () => VNode; prepend: () => VNode }>();
const { hasMore, isPending } = defineProps<MessageModelRoomBaseListProps>();
const emit = defineEmits<{ loadMore: [onComplete: () => void] }>();
</script>

<template>
  <v-list>
    <slot name="prepend" />
    <template v-if="isPending">
      <MessageModelRoomSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <slot />
      <StyledWaypoint :is-active="hasMore" @change="emit('loadMore', $event)">
        <MessageModelRoomSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
