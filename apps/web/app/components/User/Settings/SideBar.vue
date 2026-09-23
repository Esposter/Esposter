<script setup lang="ts">
import { UserSettingsPageSections } from "@/models/user/UserSettingsPageSection";
import { UserSettingsPageSectionMap } from "@/services/user/settings/UserSettingsPageSectionMap";

const visibleIds = useVisibleSectionIds(UserSettingsPageSections);
</script>

<template>
  <nav aria-label="Settings sections" p-2 ui-frame>
    <ul relative>
      <StyledSlideIndicator :active-keys="visibleIds" />
      <li v-for="section of UserSettingsPageSections" :key="section">
        <NuxtLink
          :class="visibleIds.includes(section) ? 'text-accent' : 'text-text'"
          :aria-current="visibleIds.includes(section) ? 'location' : undefined"
          :data-slide-indicator-key="section"
          :to="{ hash: `#${section}` }"
          px-3
          py-1
          no-underline
          block
          hover:bg="accent/10"
          replace
        >
          {{ UserSettingsPageSectionMap[section].title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
