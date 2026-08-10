<script setup lang="ts">
import { useSettingsScrollSpy } from "@/composables/message/user/settings/useSettingsScrollSpy";
import { UserSettingsContentMap } from "@/services/message/user/settings/UserSettingsContentMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

interface UserSettingsContentProps {
  settingsType: keyof typeof UserSettingsContentMap;
}

const { settingsType } = defineProps<UserSettingsContentProps>();
const userSettingsDialogStore = useUserSettingsDialogStore();
const { isDrawerOpen, isVisible } = storeToRefs(userSettingsDialogStore);
const { smAndDown } = useVDisplay();
const component = computed(() => UserSettingsContentMap[settingsType]);
useSettingsScrollSpy();
</script>

<template>
  <MessageModelSettingsContent>
    <template #header>
      <v-sheet tag="header" px-4 py-4 flex items-center justify-between>
        <div flex gap-2 items-center>
          <StyledTooltipIconButton v-if="smAndDown" icon="mdi-menu" text="Show menu" @click="isDrawerOpen = true" />
          <div font-bold text-headline-medium>{{ settingsType }}</div>
        </div>
        <StyledTooltipIconButton
          :button-props="{ variant: 'text' }"
          icon="mdi-close"
          text="Close"
          @click="isVisible = false"
        />
      </v-sheet>
    </template>
    <!-- The scroll area owns its bottom breathing room, so no panel carries a trailing margin of its own -->
    <div pb-8>
      <!-- Timeout 0 shows the skeleton on every tab switch instead of keeping the stale panel -->
      <Suspense v-if="component" :timeout="0">
        <component :is="component" />
        <template #fallback>
          <MessageModelSettingsSkeleton />
        </template>
      </Suspense>
    </div>
  </MessageModelSettingsContent>
</template>
