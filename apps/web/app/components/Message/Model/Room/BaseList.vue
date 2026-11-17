<script setup lang="ts">
import { DEFAULT_PAGE_LIMIT } from "@esposter/db-schema";

interface Props {
  hasMore: boolean;
  isCollapsed?: boolean | undefined;
  isPending: boolean;
}

defineSlots<{ default: () => VNode; prepend: () => VNode }>();
const { isCollapsed = false } = defineProps<Props>();
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
          <UiListRowSkeleton v-for="index of DEFAULT_PAGE_LIMIT" :key="index" />
        </template>
        <template v-else>
          <slot />
          <StyledWaypoint :is-active="hasMore" @change="emit('loadMore', $event)">
            <UiListRowSkeleton v-for="index of DEFAULT_PAGE_LIMIT" :key="index" />
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
