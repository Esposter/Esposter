<script setup lang="ts">
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <div px-4 py-8 flex flex-col gap-8 ui-body>
      <UserIntroductionCard />
      <div flex flex-col gap-8 md:flex-row md:items-start>
        <UserSettingsSideBar shrink-0 md:top-4 md:sticky />
        <div flex flex-1 flex-col gap-12 min-w-0>
          <UserSettingsSection :section="UserSettingsPageSection.Profile">
            <UserProfileCard />
          </UserSettingsSection>
          <UserSettingsSection :section="UserSettingsPageSection.LinkedAccounts">
            <UserLinkedAccountsCard />
          </UserSettingsSection>
          <UserSettingsSection :section="UserSettingsPageSection.Sessions">
            <UserSessionsCard />
          </UserSettingsSection>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
