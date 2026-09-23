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
  <!-- The section is its own anchor, and the scroll margin keeps an anchored link from landing flush with the edge —
       which the scrollspy reads back as the top of the visible band -->
  <section :id="section" flex flex-col gap-4 scroll-mt-4>
    <div flex flex-col gap-1>
      <h2 ui-heading>{{ UserSettingsPageSectionMap[section].title }}</h2>
      <p text-muted>{{ UserSettingsPageSectionMap[section].subtitle }}</p>
    </div>
    <slot />
  </section>
</template>
