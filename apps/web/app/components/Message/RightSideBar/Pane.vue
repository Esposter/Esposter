<script setup lang="ts">
interface Props {
  // A body that is one list which pads and scrolls itself draws bare, so the pane adds no second padding around it
  isBodyBare?: true;
  title: string;
}

// The title bar's commands stand before its close button, and the default slot is the body, which scrolls under the bar.
// The footer slot is the row pinned under the body, drawn only when a call site passes content for it
const slots = defineSlots<{ actions?: () => VNode; default: () => VNode; footer?: () => VNode }>();
const emit = defineEmits<{ close: [] }>();
const { isBodyBare, title } = defineProps<Props>();
</script>

<template>
  <div flex flex-1 flex-col min-h-0 min-w-0>
    <MessageRightSideBarHeader :title @close="emit('close')">
      <template #actions>
        <slot name="actions" />
      </template>
    </MessageRightSideBarHeader>
    <div ui-region-body :class="isBodyBare ? undefined : 'p-3'">
      <slot />
    </div>
    <div v-if="slots.footer" shrink-0>
      <slot name="footer" />
    </div>
  </div>
</template>
