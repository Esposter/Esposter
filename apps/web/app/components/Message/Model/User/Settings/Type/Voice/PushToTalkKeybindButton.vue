<script setup lang="ts">
import { useUserSettingsStore } from "@/store/message/user/settings";

interface Props {
  keybind: string;
}

const { keybind } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const isCapturingKeybind = ref(false);

useEventListener("keydown", async (event) => {
  if (!isCapturingKeybind.value) return;
  event.preventDefault();
  isCapturingKeybind.value = false;
  if (event.code === "Escape") return;
  await updateUserSettings({ pushToTalkKeybind: event.code });
});
</script>

<template>
  <div mt-4 max-w-100>
    <div font-semibold mb-1 text-body-medium>Push-to-talk Keybind</div>
    <v-text-field
      :model-value="isCapturingKeybind ? '' : keybind"
      :placeholder="isCapturingKeybind ? 'Press a key… (Esc to cancel)' : 'No Keybind Set'"
      bg-color="background"
      density="compact"
      readonly
    >
      <template #append-inner>
        <v-btn
          :color="isCapturingKeybind ? 'error' : 'primary'"
          size="small"
          variant="tonal"
          @click="isCapturingKeybind = !isCapturingKeybind"
        >
          {{ isCapturingKeybind ? "Stop Recording" : "Record Keybind" }}
        </v-btn>
      </template>
    </v-text-field>
  </div>
</template>
