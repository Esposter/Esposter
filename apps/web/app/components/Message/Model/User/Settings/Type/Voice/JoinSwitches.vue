<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
</script>

<template>
  <v-switch
    label="Mute on join"
    :model-value="userSettings.isMuteOnJoin"
    @update:model-value="updateUserSettings({ isMuteOnJoin: Boolean($event) })"
  />
  <v-switch
    label="Deafen on join"
    :model-value="userSettings.isDeafenOnJoin"
    @update:model-value="updateUserSettings({ isDeafenOnJoin: Boolean($event) })"
  />
</template>
