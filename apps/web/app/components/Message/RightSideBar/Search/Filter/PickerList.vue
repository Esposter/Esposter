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
  <div flex flex-col of-y-auto>
    <div v-if="isPending" aria-busy="true" flex flex-col>
      <div v-for="i in DEFAULT_READ_LIMIT" :key="i" ui-row>
        <UiSkeleton shrink-0 size-6 />
        <UiSkeleton flex-1 h-4 />
      </div>
    </div>
    <template v-else>
      <slot />
      <StyledWaypoint :is-active="hasMore" @change="emit('readMore', $event)">
        <div v-for="i in DEFAULT_READ_LIMIT" :key="i" ui-row>
          <UiSkeleton shrink-0 size-6 />
          <UiSkeleton flex-1 h-4 />
        </div>
      </StyledWaypoint>
    </template>
  </div>
</template>
