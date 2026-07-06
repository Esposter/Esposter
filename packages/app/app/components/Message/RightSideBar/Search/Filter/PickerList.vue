<script setup lang="ts">
interface MessageRightSideBarSearchFilterPickerListProps {
  hasMore: boolean;
  isPending: boolean;
}

defineSlots<{ default: () => VNode; skeleton: () => VNode }>();
const { hasMore, isPending } = defineProps<MessageRightSideBarSearchFilterPickerListProps>();
const emit = defineEmits<{ readMore: [onComplete: () => void] }>();
</script>

<template>
  <v-list density="compact" py-0 overflow-y-auto>
    <template v-if="isPending">
      <slot name="skeleton" />
    </template>
    <template v-else>
      <slot />
      <StyledWaypoint :is-active="hasMore" @change="emit('readMore', $event)">
        <slot name="skeleton" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
