<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { MS_PER_MINUTE } from "@/services/message/user/settings/constants";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_AUTO_IDLE_THRESHOLD_MS, MIN_AUTO_IDLE_THRESHOLD_MS } from "@esposter/db-schema";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: editedAutoIdleThresholdMinutes } = useCloned(() => userSettings.autoIdleThresholdMs / MS_PER_MINUTE);
</script>

<template>
  <p text-muted>How long you go without activity before your status turns idle.</p>
  <UiSlider
    v-model="editedAutoIdleThresholdMinutes"
    is-label-hidden
    label="Idle timeout"
    :max="MAX_AUTO_IDLE_THRESHOLD_MS / MS_PER_MINUTE"
    :min="MIN_AUTO_IDLE_THRESHOLD_MS / MS_PER_MINUTE"
    :step="1"
    :value-text="`${editedAutoIdleThresholdMinutes} min`"
    @end="(minutes) => updateUserSettings({ autoIdleThresholdMs: minutes * MS_PER_MINUTE })"
  />
</template>
