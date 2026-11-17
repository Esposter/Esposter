<script setup lang="ts">
import { DEFAULT_PAGE_LIMIT } from "@esposter/db-schema";

interface Props {
  hasMore: boolean;
  isPending: boolean;
}

defineSlots<{ default: () => VNode }>();
defineProps<Props>();
const emit = defineEmits<{ readMore: [onComplete: () => void] }>();
</script>

<template>
  <div flex flex-col of-y-auto>
    <div v-if="isPending" aria-busy="true" flex flex-col>
      <UiListRowSkeleton v-for="i in DEFAULT_PAGE_LIMIT" :key="i" />
    </div>
    <template v-else>
      <slot />
      <StyledWaypoint :is-active="hasMore" @change="emit('readMore', $event)">
        <UiListRowSkeleton v-for="i in DEFAULT_PAGE_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </div>
</template>
