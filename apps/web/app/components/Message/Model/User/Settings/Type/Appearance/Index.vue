<script setup lang="ts">
import { AppearanceSettingsSection } from "#src/models/message/user/settings/AppearanceSettingsSection";
</script>

<template>
  <MessageModelUserSettingsSection :title="AppearanceSettingsSection.MessageDisplay">
    <MessageModelUserSettingsTypeAppearanceMessageDisplayField />
  </MessageModelUserSettingsSection>
</template>
