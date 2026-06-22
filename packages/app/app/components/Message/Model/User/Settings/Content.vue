<script setup lang="ts">
import { UserSettingsContentMap } from "@/services/message/user/settings/UserSettingsContentMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

interface UserSettingsContentProps {
  settingsType: keyof typeof UserSettingsContentMap;
}

const { settingsType } = defineProps<UserSettingsContentProps>();
const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible } = storeToRefs(userSettingsDialogStore);
const component = computed(() => UserSettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <header mb-4 pb-4 bg-surface flex items-center top-0 justify-between sticky z-1>
      <div font-bold text-headline-medium>{{ settingsType }}</div>
      <v-tooltip text="Close">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="tooltipProps" icon="mdi-close" variant="text" @click="isVisible = false" />
        </template>
      </v-tooltip>
    </header>
    <component :is="component" v-if="component" />
  </MessageModelSettingsContent>
</template>
