<script setup lang="ts">
interface Props {
  isActive?: true;
  isDanger?: true;
}

defineSlots<{ default: () => VNode }>();
const { isActive, isDanger } = defineProps<Props>();
</script>

<template>
  <button
    :class="{ active: isActive, danger: isDanger }"
    class="button"
    px-2
    shrink-0
    cursor-pointer
    disabled:cursor-default
    hover:brightness-125
    disabled:op-disabled
    type="button"
  >
    <slot />
  </button>
</template>

<style scoped>
/* A raised block: lit along its top and left edges, shaded along the others */
.button {
  background-color: var(--agent-console-panel-edge);
  box-shadow:
    inset -0.125rem -0.125rem 0 0 color-mix(in srgb, var(--agent-console-background) 45%, transparent),
    inset 0.125rem 0.125rem 0 0 color-mix(in srgb, var(--agent-console-text) 20%, transparent);
}

/* Doubled so a variant outranks the page's rule that gives every button the text colour */
.button.active {
  background-color: var(--agent-console-accent);
  color: var(--agent-console-background);
}

.button.danger {
  background-color: var(--agent-console-error);
  color: var(--agent-console-background);
}
</style>
