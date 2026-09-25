<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";

interface Props {
  hasMore: boolean;
  isCollapsed?: boolean;
  isPending: boolean;
}

defineSlots<{ default: () => VNode; prepend: () => VNode }>();
const { hasMore, isCollapsed = false, isPending } = defineProps<Props>();
const emit = defineEmits<{ loadMore: [onComplete: () => void] }>();
</script>

<template>
  <div flex flex-col>
    <slot name="prepend" />
    <!-- Folds shut rather than vanishing, and holds nothing a reader can reach while it is shut -->
    <div class="fold" :data-collapsed="isCollapsed || undefined" :inert="isCollapsed">
      <div flex flex-col min-h-0 of-hidden>
        <!-- A room row's own shape while the first page is on its way: a picture's mark and a name -->
        <template v-if="isPending">
          <div v-for="index of DEFAULT_READ_LIMIT" :key="index" ui-row>
            <UiSkeleton shrink-0 size-6 />
            <UiSkeleton flex-1 h-4 />
          </div>
        </template>
        <template v-else>
          <slot />
          <StyledWaypoint :is-active="hasMore" @change="emit('loadMore', $event)">
            <div v-for="index of DEFAULT_READ_LIMIT" :key="index" ui-row>
              <UiSkeleton shrink-0 size-6 />
              <UiSkeleton flex-1 h-4 />
            </div>
          </StyledWaypoint>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fold {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--ui-motion-medium);
}

.fold[data-collapsed] {
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--ui-motion-short);
}
</style>
