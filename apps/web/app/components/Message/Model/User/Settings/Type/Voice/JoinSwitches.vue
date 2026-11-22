<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "#src/store/message/user/settings/index";

interface Props {
  userSettings: UserSettingsInMessage;
}

defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
</script>

<template>
  <div flex flex-col gap-3>
    <UiSwitch
      :model-value="userSettings.isMuteOnJoin"
      is-label-visible
      label="Mute on join"
      @update:model-value="(newModelValue) => updateUserSettings({ isMuteOnJoin: newModelValue })"
    />
    <UiSwitch
      :model-value="userSettings.isDeafenOnJoin"
      is-label-visible
      label="Deafen on join"
      @update:model-value="(newModelValue) => updateUserSettings({ isDeafenOnJoin: newModelValue })"
    />
  </div>
</template>
