<script setup lang="ts">
interface Props {
  // A body that is one list which pads and scrolls itself draws bare, so the pane adds no second padding around it
  isBodyBare?: true | undefined;
  title: string;
}

// The title bar's commands stand before its close button, and the default slot is the body, which scrolls under the bar.
// The header slot is the row pinned under the title bar, and the footer slot the row pinned under the body.
// Each is drawn only when a call site passes content for it, so neither scrolls with the body
const slots = defineSlots<{
  actions?: () => VNode;
  default: () => VNode;
  footer?: () => VNode;
  header?: () => VNode;
}>();
defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div flex flex-1 flex-col min-h-0 min-w-0>
    <MessageRightSideBarHeader :title @close="emit('close')">
      <template #actions>
        <slot name="actions" />
      </template>
    </MessageRightSideBarHeader>
    <div v-if="slots.header" shrink-0>
      <slot name="header" />
    </div>
    <div ui-region-body :class="isBodyBare ? undefined : 'p-3'">
      <slot />
    </div>
    <div v-if="slots.footer" shrink-0>
      <slot name="footer" />
    </div>
  </div>
</template>
