<script setup lang="ts">
import { UserSettingsContentMap } from "@/services/message/user/settings/UserSettingsContentMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

interface Props {
  settingsType: keyof typeof UserSettingsContentMap;
}

const { settingsType } = defineProps<Props>();
const userSettingsDialogStore = useUserSettingsDialogStore();
const { isDrawerOpen, isVisible } = storeToRefs(userSettingsDialogStore);
const component = computed(() => UserSettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <template #header>
      <MessageModelSettingsHeader :title="settingsType" @close="isVisible = false" @open:drawer="isDrawerOpen = true" />
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
