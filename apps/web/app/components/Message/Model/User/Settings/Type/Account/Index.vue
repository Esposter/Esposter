<script setup lang="ts">
import { AccountSettingsSections } from "#src/models/message/user/settings/AccountSettingsSection";
import { AccountSettingsCardMap } from "#src/services/message/user/settings/AccountSettingsCardMap";
</script>

<template>
  <!-- The same two cards /user/settings is built from, rather than a second form over the same fields: a rename
    that succeeded from one surface and failed from the other is exactly what two copies of a form produce -->
  <MessageModelUserSettingsSection v-for="section of AccountSettingsSections" :key="section" :title="section">
    <component :is="AccountSettingsCardMap[section]" />
  </MessageModelUserSettingsSection>
</template>
