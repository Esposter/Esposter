<script setup lang="ts">
import { AccountSettingsSection } from "@/models/message/user/settings/AccountSettingsSection";
</script>

<template>
  <!-- The same two cards /user/settings is built from, rather than a second form over the same fields: a rename
    that succeeded from one surface and failed from the other is exactly what two copies of a form produce -->
  <MessageModelUserSettingsSection :title="AccountSettingsSection.Profile">
    <UserProfileCard />
  </MessageModelUserSettingsSection>
  <MessageModelUserSettingsSection :title="AccountSettingsSection.LinkedAccounts">
    <UserLinkedAccountsCard />
  </MessageModelUserSettingsSection>
</template>
