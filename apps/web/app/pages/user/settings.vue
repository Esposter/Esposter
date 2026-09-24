<script setup lang="ts">
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { UserSettingsPageLinkItem } from "@/services/app/UserSettingsPageLinkItem";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ UserSettingsPageLinkItem.title }}</Title>
    </Head>
    <div px-4 py-6 flex flex-col gap-8 ui-body>
      <UserIntroductionCard />
      <div flex flex-col gap-8 md:flex-row md:items-start>
        <UserSettingsSideBar shrink-0 md:top-4 md:sticky />
        <div flex flex-1 flex-col gap-10 min-w-0>
          <UserProfileCard :section="UserSettingsPageSection.Profile" />
          <UserLinkedAccountsCard :section="UserSettingsPageSection.LinkedAccounts" />
          <UserSessionsCard :section="UserSettingsPageSection.Sessions" />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
