<script setup lang="ts">
interface Props {
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { title } = defineProps<Props>();
</script>

<template>
  <section flex flex-col gap-2>
    <h2 ui-heading>{{ title }}</h2>
    <slot />
  </section>
</template>
