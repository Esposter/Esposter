<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // What a read that returned nothing says, as UiEmptyState takes it. A list with no empty state of its own leaves it
  // Unset, and an empty read then draws nothing
  emptyState?: { description: string; meaning: UiIconMeaning; title: string };
  // The read's failure message, "" while it has none, which is what useQuery holds
  error: string;
  // The read has settled with nothing in it
  isEmpty?: true;
  // The read is out with nothing to show yet. A caller keeps the rows a previous read left on screen by not setting it
  isPending?: true;
}

// A list a read fills has four regions, and the one that applies is the one drawn. A failure shows over a pending flag,
// Since a caller's pending flag may be derived from the data alone, which a failed read leaves unset. Retry is an emit,
// So the default error state can ask again; a custom one asks through the caller's own read
defineSlots<{ default: () => VNode; empty?: () => VNode; error?: () => VNode; loading: () => VNode }>();
const { emptyState, error, isEmpty, isPending } = defineProps<Props>();
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <template v-if="error">
    <slot name="error">
      <UiErrorState :error @retry="emit('retry')" />
    </slot>
  </template>
  <slot v-else-if="isPending" name="loading" />
  <slot v-else-if="isEmpty" name="empty">
    <UiEmptyState
      v-if="emptyState"
      :description="emptyState.description"
      :meaning="emptyState.meaning"
      :title="emptyState.title"
    />
  </slot>
  <slot v-else />
</template>
