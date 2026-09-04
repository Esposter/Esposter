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
  <section :id="title" flex flex-col gap-y-4>
    <div font-bold text-title-medium>{{ title }}</div>
    <slot />
  </section>
</template>
