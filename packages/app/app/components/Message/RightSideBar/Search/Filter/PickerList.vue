<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";

interface Props {
  hasMore: boolean;
  isPending: boolean;
}

defineSlots<{ default: () => VNode }>();
const { hasMore, isPending } = defineProps<Props>();
const emit = defineEmits<{ readMore: [onComplete: () => void] }>();
</script>

<template>
  <v-list py-0 overflow-y-auto density="compact">
    <template v-if="isPending">
      <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <slot />
      <StyledWaypoint :is-active="hasMore" @change="emit('readMore', $event)">
        <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
