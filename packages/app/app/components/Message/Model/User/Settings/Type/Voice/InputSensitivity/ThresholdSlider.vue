<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

interface ThresholdSliderProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<ThresholdSliderProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: inputSensitivityDecibels } = useCloned(() => userSettings.inputSensitivityDecibels);
const { level, start } = useMicrophoneLevel();
const trackRef = useTemplateRef<HTMLDivElement>("track");
const isDragging = ref(false);
const range = MAX_INPUT_SENSITIVITY_DECIBELS - MIN_INPUT_SENSITIVITY_DECIBELS;
const levelFraction = computed(() => (level.value - MIN_INPUT_SENSITIVITY_DECIBELS) / range);
const thresholdFraction = computed(() => (inputSensitivityDecibels.value - MIN_INPUT_SENSITIVITY_DECIBELS) / range);
const setThresholdFromClientX = (clientX: number) => {
  if (!trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  inputSensitivityDecibels.value = Math.round(MIN_INPUT_SENSITIVITY_DECIBELS + fraction * range);
};
const startDrag = (event: PointerEvent) => {
  isDragging.value = true;
  setThresholdFromClientX(event.clientX);
};
useEventListener("pointermove", (event) => {
  if (isDragging.value) setThresholdFromClientX(event.clientX);
});

useEventListener("pointerup", () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  updateUserSettings({ inputSensitivityDecibels: inputSensitivityDecibels.value });
});

onMounted(() => {
  start();
});
</script>

<template>
  <div ref="track" h-5 w-full cursor-pointer relative @pointerdown="startDrag">
    <div
      top="1/2"
      translate-y="-1/2"
      rounded
      h-2
      w-full
      left-0
      absolute
      overflow-hidden
      bg="[linear-gradient(to_right,hsl(55,70%,45%),hsl(120,70%,45%))]"
    >
      <div bg-black opacity-30 h-full left-0 top-0 absolute :style="{ width: `${levelFraction * 100}%` }" />
    </div>
    <div
      top="1/2"
      translate-x="-1/2"
      translate-y="-1/2"
      rounded-full
      bg-white
      h-5
      w-5
      shadow
      absolute
      :style="{ left: `${thresholdFraction * 100}%` }"
    />
  </div>
</template>
