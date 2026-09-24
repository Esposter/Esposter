<script setup lang="ts">
import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";

interface Props {
  title: SettingsSection;
}

defineSlots<{ default: () => VNode }>();
// The title is the anchor id as well: the sidebar scrolls to it, and the scrollspy reads the section back by it
const { title } = defineProps<Props>();
</script>

<template>
  <section :id="title" flex flex-col gap-3>
    <h3 ui-heading>{{ title }}</h3>
    <slot />
  </section>
</template>
