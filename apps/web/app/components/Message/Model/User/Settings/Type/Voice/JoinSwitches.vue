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
  <div flex flex-col gap-3>
    <UiSwitch
      :model-value="userSettings.isMuteOnJoin"
      is-label-shown
      label="Mute on join"
      @update:model-value="(isMuteOnJoin) => updateUserSettings({ isMuteOnJoin })"
    />
    <UiSwitch
      :model-value="userSettings.isDeafenOnJoin"
      is-label-shown
      label="Deafen on join"
      @update:model-value="(isDeafenOnJoin) => updateUserSettings({ isDeafenOnJoin })"
    />
  </div>
</template>
