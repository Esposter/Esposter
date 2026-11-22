<script setup lang="ts">
import { DEFAULT_PAGE_LIMIT } from "@esposter/db-schema";

interface Props {
  hasMore: boolean;
  isPending: boolean;
}

defineSlots<{ default: () => VNode }>();
defineProps<Props>();
const emit = defineEmits<{ loadMore: [onComplete: () => void] }>();
</script>

<template>
  <div flex flex-col>
    <template v-if="isPending">
      <!-- A room row's own shape while the first page is on its way: a picture's mark and a name -->
      <UiListRowSkeleton v-for="index of DEFAULT_PAGE_LIMIT" :key="index" />
    </template>
    <template v-else>
      <slot />
      <StyledWaypoint :is-active="hasMore" @change="emit('loadMore', $event)">
        <UiListRowSkeleton v-for="index of DEFAULT_PAGE_LIMIT" :key="index" />
      </StyledWaypoint>
    </template>
  </div>
</template>
