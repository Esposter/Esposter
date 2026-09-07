<script setup lang="ts">
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

definePageMeta({ middleware: "auth" });

const { smAndDown } = useVDisplay();
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col>
          <UserIntroductionCard />
        </v-col>
      </v-row>
      <v-row>
        <v-col :cols="smAndDown ? 12 : 5">
          <UserSettingsSideBar sticky top="[calc(1rem+--app-bar-height)]" />
        </v-col>
        <v-col :cols="smAndDown ? 12 : 7" flex flex-col gap-12>
          <UserSettingsSection :section="UserSettingsPageSection.Profile">
            <UserProfileCard />
          </UserSettingsSection>
          <UserSettingsSection :section="UserSettingsPageSection.LinkedAccounts">
            <UserLinkedAccountsCard />
          </UserSettingsSection>
          <UserSettingsSection :section="UserSettingsPageSection.Sessions">
            <UserSessionsCard />
          </UserSettingsSection>
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
