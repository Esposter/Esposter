<script setup lang="ts">
import { UserSettingsPageSections } from "@/models/user/UserSettingsPageSection";
import { UserSettingsPageSectionMap } from "@/services/user/settings/UserSettingsPageSectionMap";

const visibleIds = useVisibleSectionIds(UserSettingsPageSections);
</script>

<template>
  <StyledCard>
    <v-list px-2 relative>
      <StyledSlideIndicator :active-keys="visibleIds" />
      <v-list-item
        v-for="section of UserSettingsPageSections"
        :key="section"
        :active="visibleIds.includes(section)"
        :data-slide-indicator-key="section"
        :to="{ hash: `#${section}` }"
        replace
        rd
      >
        {{ UserSettingsPageSectionMap[section].title }}
      </v-list-item>
    </v-list>
  </StyledCard>
</template>
