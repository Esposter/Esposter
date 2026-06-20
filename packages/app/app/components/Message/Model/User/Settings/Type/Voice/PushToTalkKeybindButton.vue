<script setup lang="ts">
import { useUserSettingsStore } from "@/store/message/user/settings";

interface PushToTalkKeybindButtonProps {
  keybind: string;
}

const { keybind } = defineProps<PushToTalkKeybindButtonProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const isCapturingKeybind = ref(false);

useEventListener("keydown", async (event) => {
  if (!isCapturingKeybind.value) return;
  event.preventDefault();
  isCapturingKeybind.value = false;
  await updateUserSettings({ pushToTalkKeybind: event.code });
});
</script>

<template>
  <div mt-2 flex gap-2 items-center>
    <v-btn :color="isCapturingKeybind ? 'primary' : undefined" @click="isCapturingKeybind = true">
      {{ isCapturingKeybind ? "Press a key…" : keybind || "Set keybind" }}
    </v-btn>
  </div>
</template>
