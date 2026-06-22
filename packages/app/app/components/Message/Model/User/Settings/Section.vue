<script setup lang="ts">
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

interface UserSettingsSectionProps {
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { title } = defineProps<UserSettingsSectionProps>();
const userSettingsDialogStore = useUserSettingsDialogStore();
const { activeSectionId, isScrollingToSection } = storeToRefs(userSettingsDialogStore);
</script>

<template>
  <section
    :id="title"
    v-intersect="{
      handler: (isIntersecting: boolean) => {
        if (isIntersecting && !isScrollingToSection) activeSectionId = title;
      },
      options: { rootMargin: '0px 0px -80% 0px' },
    }"
    mb-8
  >
    <div font-bold mb-4 text-title-medium>{{ title }}</div>
    <slot />
  </section>
</template>
