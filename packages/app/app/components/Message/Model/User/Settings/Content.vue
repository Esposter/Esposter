<script setup lang="ts">
import { useSettingsScrollSpy } from "@/composables/message/user/settings/useSettingsScrollSpy";
import { UserSettingsContentMap } from "@/services/message/user/settings/UserSettingsContentMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

interface UserSettingsContentProps {
  settingsType: keyof typeof UserSettingsContentMap;
}

const { settingsType } = defineProps<UserSettingsContentProps>();
const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible } = storeToRefs(userSettingsDialogStore);
const component = computed(() => UserSettingsContentMap[settingsType]);
useSettingsScrollSpy();
</script>

<template>
  <MessageModelSettingsContent>
    <template #header>
      <v-sheet tag="header" px-4 py-4 flex items-center justify-between>
        <div font-bold text-headline-medium>{{ settingsType }}</div>
        <v-tooltip text="Close">
          <template #activator="{ props: tooltipProps }">
            <v-btn :="tooltipProps" icon="mdi-close" variant="text" @click="isVisible = false" />
          </template>
        </v-tooltip>
      </v-sheet>
    </template>
    <!-- Timeout 0 shows the skeleton on every tab switch instead of keeping the stale panel -->
    <Suspense v-if="component" :timeout="0">
      <component :is="component" />
      <template #fallback>
        <MessageModelSettingsSkeleton />
      </template>
    </Suspense>
  </MessageModelSettingsContent>
</template>
