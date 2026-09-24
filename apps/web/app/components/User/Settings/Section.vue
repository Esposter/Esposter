<script setup lang="ts">
import type { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

import { UserSettingsPageSectionMap } from "@/services/user/settings/UserSettingsPageSectionMap";

interface Props {
  // Absent where a surface of its own already heads the card, as the room's user settings do
  section?: UserSettingsPageSection;
}

const slots = defineSlots<{ actions?: () => VNode; default: () => VNode }>();
const { section } = defineProps<Props>();
</script>

<template>
  <!-- The section is its own anchor, and the scroll margin keeps an anchored link from landing flush with the edge —
       which the scrollspy reads back as the top of the visible band -->
  <section :id="section" flex flex-col gap-3 scroll-mt-4>
    <header v-if="section || slots.actions" flex gap-2 min-h-8 items-center>
      <div flex flex-1 gap-2 min-w-0 items-baseline>
        <template v-if="section">
          <h2 shrink-0 ui-heading>{{ UserSettingsPageSectionMap[section].title }}</h2>
          <p text-sm text-muted truncate>{{ UserSettingsPageSectionMap[section].subtitle }}</p>
        </template>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>
