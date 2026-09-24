<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useUserSettingsStore } from "@/store/message/user/settings";

interface Props {
  keybind: string;
}

const { keybind } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const isCapturingKeybind = ref(false);
// Held for as long as it acts rather than pressed once, so it is recorded here rather than bound as a shortcut
useEventListener("keydown", async (event) => {
  if (!isCapturingKeybind.value) return;
  event.preventDefault();
  isCapturingKeybind.value = false;
  if (event.code === "Escape") return;
  await updateUserSettings({ pushToTalkKeybind: event.code });
});
</script>

<template>
  <div flex gap-2 items-center>
    <span flex-1>Push to talk keybind</span>
    <!-- The key as a key cap, set into the page as a field is -->
    <kbd aria-live="polite" px-2 py-1 ui-field>
      {{ isCapturingKeybind ? "Press a key… (Esc to cancel)" : keybind || "No keybind set" }}
    </kbd>
    <UiButton
      :aria-pressed="isCapturingKeybind"
      :variant="UiButtonVariant.Quiet"
      @click="isCapturingKeybind = !isCapturingKeybind"
    >
      {{ isCapturingKeybind ? "Stop recording" : "Record keybind" }}
    </UiButton>
  </div>
</template>
