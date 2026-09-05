<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: editedInputSensitivityDecibels } = useCloned(() => userSettings.inputSensitivityDecibels);
const { level, start } = useMicrophoneLevel();
const track = useTemplateRef("track");
const isDragging = ref(false);
const range = MAX_INPUT_SENSITIVITY_DECIBELS - MIN_INPUT_SENSITIVITY_DECIBELS;
const setThresholdFromClientX = (clientX: number) => {
  if (!track.value) return;
  const rect = track.value.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  editedInputSensitivityDecibels.value = Math.round(MIN_INPUT_SENSITIVITY_DECIBELS + fraction * range);
};
const startDrag = (event: PointerEvent) => {
  isDragging.value = true;
  setThresholdFromClientX(event.clientX);
};
useEventListener("pointermove", (event) => {
  if (isDragging.value) setThresholdFromClientX(event.clientX);
});

useEventListener("pointerup", async () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  await updateUserSettings({ inputSensitivityDecibels: editedInputSensitivityDecibels.value });
});

onMounted(async () => {
  await start();
});
</script>

<template>
  <div ref="track" h-5 w-full cursor-pointer relative @pointerdown="startDrag">
    <div
      top="1/2"
      translate-y="-1/2"
      rd
      h-2
      w-full
      left-0
      absolute
      overflow-hidden
      bg="[linear-gradient(to_right,hsl(55,70%,45%),hsl(120,70%,45%))]"
    >
      <div
        bg-black
        op-30
        h-full
        left-0
        top-0
        absolute
        :style="{ width: `${((level - MIN_INPUT_SENSITIVITY_DECIBELS) / range) * 100}%` }"
      />
    </div>
    <div
      top="1/2"
      translate-x="-1/2"
      translate-y="-1/2"
      rd-full
      bg-white
      size-5
      shadow
      absolute
      :style="{ left: `${((editedInputSensitivityDecibels - MIN_INPUT_SENSITIVITY_DECIBELS) / range) * 100}%` }"
    />
  </div>
</template>
