<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";

interface JoinSwitchesProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<JoinSwitchesProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
</script>

<template>
  <v-switch
    color="primary"
    label="Mute on join"
    :model-value="userSettings.isMuteOnJoin"
    hide-details
    @update:model-value="updateUserSettings({ isMuteOnJoin: Boolean($event) })"
  />
  <v-switch
    color="primary"
    label="Deafen on join"
    :model-value="userSettings.isDeafenOnJoin"
    hide-details
    @update:model-value="updateUserSettings({ isDeafenOnJoin: Boolean($event) })"
  />
</template>
