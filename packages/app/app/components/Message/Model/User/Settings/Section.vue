<script setup lang="ts">
import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";

import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

interface UserSettingsSectionProps {
  title: SettingsSection;
}

defineSlots<{ default: () => VNode }>();
const { title } = defineProps<UserSettingsSectionProps>();
const userSettingsDialogStore = useUserSettingsDialogStore();
const { setSectionVisibility } = userSettingsDialogStore;
const section = useTemplateRef("section");
const isVisible = useElementVisibility(section);

watchImmediate(isVisible, (newIsVisible) => {
  setSectionVisibility(title, newIsVisible);
});

onUnmounted(() => {
  setSectionVisibility(title, false);
});
</script>

<template>
  <section :id="title" ref="section" mb-8>
    <div font-bold mb-4 text-title-medium>{{ title }}</div>
    <slot />
  </section>
</template>
