<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { VoiceInputModeLabelMap } from "@/services/message/user/settings/VoiceInputModeLabelMap";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";
import {
  MAX_INPUT_SENSITIVITY_DECIBELS,
  MAX_USER_VOLUME_PERCENTAGE,
  MIN_INPUT_SENSITIVITY_DECIBELS,
  VoiceInputMode,
} from "@esposter/db-schema";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const { updateUserSettings } = userSettingsStore;
const deviceStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId, inputDeviceId, outputDeviceId } = storeToRefs(deviceStore);

const audioInputItems = ref<SelectItemCategoryDefinition<string>[]>([]);
const audioOutputItems = ref<SelectItemCategoryDefinition<string>[]>([]);
const videoInputItems = ref<SelectItemCategoryDefinition<string>[]>([]);
const enumerateDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const toItems = (kind: MediaDeviceKind): SelectItemCategoryDefinition<string>[] =>
    devices
      .filter((device) => device.kind === kind)
      .map((device) => ({ title: device.label || device.deviceId, value: device.deviceId }));
  audioInputItems.value = toItems("audioinput");
  audioOutputItems.value = toItems("audiooutput");
  videoInputItems.value = toItems("videoinput");
};

const isCapturingKeybind = ref(false);
const onKeydown = (event: KeyboardEvent) => {
  if (!isCapturingKeybind.value) return;
  event.preventDefault();
  updateUserSettings({ pushToTalkKeybind: event.code });
  isCapturingKeybind.value = false;
};

const inputSensitivityDecibels = ref(0);
const defaultUserVolumePercentage = ref(0);
watchEffect(() => {
  if (!userSettings.value) return;
  inputSensitivityDecibels.value = userSettings.value.inputSensitivityDecibels;
  defaultUserVolumePercentage.value = userSettings.value.defaultUserVolumePercentage;
});

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
  await enumerateDevices();
});
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
});
</script>

<template>
  <v-container v-if="userSettings" fluid>
    <div font-bold mb-4 text-title-medium>Voice & Video</div>

    <div font-bold mb-2 text-body-large>Input Mode</div>
    <v-radio-group
      :model-value="userSettings.voiceInputMode"
      hide-details
      @update:model-value="updateUserSettings({ voiceInputMode: $event as VoiceInputMode })"
    >
      <v-radio
        v-for="mode of Object.values(VoiceInputMode)"
        :key="mode"
        :label="VoiceInputModeLabelMap[mode]"
        :value="mode"
      />
    </v-radio-group>

    <div v-if="userSettings.voiceInputMode === VoiceInputMode.PushToTalk" mt-2 flex gap-2 items-center>
      <v-btn :color="isCapturingKeybind ? 'primary' : undefined" @click="isCapturingKeybind = true">
        {{ isCapturingKeybind ? "Press a key…" : userSettings.pushToTalkKeybind || "Set keybind" }}
      </v-btn>
    </div>

    <v-divider my-4 />

    <div font-bold mb-2 text-body-large>Input Sensitivity: {{ inputSensitivityDecibels }} dB</div>
    <v-slider
      v-model="inputSensitivityDecibels"
      :max="MAX_INPUT_SENSITIVITY_DECIBELS"
      :min="MIN_INPUT_SENSITIVITY_DECIBELS"
      :step="1"
      hide-details
      @end="updateUserSettings({ inputSensitivityDecibels: $event })"
    />

    <v-divider my-4 />

    <v-select
      v-model="inputDeviceId"
      :items="audioInputItems"
      label="Input Device"
      density="comfortable"
      hide-details
      mb-4
    />
    <v-select
      v-model="outputDeviceId"
      :items="audioOutputItems"
      label="Output Device"
      density="comfortable"
      hide-details
      mb-4
    />
    <v-select v-model="cameraDeviceId" :items="videoInputItems" label="Camera" density="comfortable" hide-details />

    <v-divider my-4 />

    <v-switch
      :model-value="userSettings.isMuteOnJoin"
      label="Mute on join"
      color="primary"
      hide-details
      @update:model-value="updateUserSettings({ isMuteOnJoin: Boolean($event) })"
    />
    <v-switch
      :model-value="userSettings.isDeafenOnJoin"
      label="Deafen on join"
      color="primary"
      hide-details
      @update:model-value="updateUserSettings({ isDeafenOnJoin: Boolean($event) })"
    />

    <v-divider my-4 />

    <div font-bold mb-2 text-body-large>Default User Volume: {{ defaultUserVolumePercentage }}%</div>
    <v-slider
      v-model="defaultUserVolumePercentage"
      :max="MAX_USER_VOLUME_PERCENTAGE"
      :min="0"
      :step="1"
      hide-details
      @end="updateUserSettings({ defaultUserVolumePercentage: $event })"
    />
  </v-container>
</template>
