<script setup lang="ts">
import type { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

import { UserSettingsPageSectionMap } from "@/services/user/settings/UserSettingsPageSectionMap";

interface Props {
  section: UserSettingsPageSection;
}

defineSlots<{ default: () => VNode }>();
const { section } = defineProps<Props>();
</script>

<template>
  <!-- The section is its own anchor, and the scroll margin clears the sticky app bar an anchored link would
       otherwise land behind — which the scrollspy reads back as the top of the visible band -->
  <section :id="section" scroll-mt="[calc(1rem+--app-bar-height)]" flex flex-col gap-y-6>
    <div flex flex-col>
      <div font-bold text-title-large>{{ UserSettingsPageSectionMap[section].title }}</div>
      <div text-body-large>{{ UserSettingsPageSectionMap[section].subtitle }}</div>
    </div>
    <slot />
  </section>
</template>
