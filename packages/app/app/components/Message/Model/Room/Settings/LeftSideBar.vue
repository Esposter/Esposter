<script setup lang="ts">
import type { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import type { RoomInMessage } from "@esposter/db-schema";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { SettingsCategories, SettingsCategory } from "@/models/message/room/SettingsCategory";
import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsCategoryMap } from "@/services/message/settings/SettingsCategoryMap";
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";
import { SettingsPermissionMap } from "@/services/message/settings/SettingsPermissionMap";
import { useRoleStore } from "@/store/message/room/role";

interface LeftSideBarProps {
  room: RoomInMessage;
}

const { room } = defineProps<LeftSideBarProps>();
const modelValue = defineModel<keyof typeof SettingsContentMap>({ required: true });
const isDrawerOpen = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ "open:delete": [] }>();
const roleStore = useRoleStore();
const { getMyPermissions } = roleStore;
const checkIsVisible = (settingsType: SettingsType) => {
  const permission = SettingsPermissionMap[settingsType];
  if (!permission) return true;
  const myPermissions = getMyPermissions(room.id);
  if (!myPermissions) return false;
  return hasPermission(myPermissions.permissions, permission, myPermissions.isRoomOwner);
};
const visibleCategories = computed(() =>
  Object.entries(SettingsCategoryMap)
    .map(([category, settingsTypes]) => ({
      category: category as SettingsCategory,
      settingsTypes: settingsTypes.filter((settingsType) => checkIsVisible(settingsType)),
    }))
    .filter(({ settingsTypes }) => settingsTypes.length > 0),
);
// Discord heads the first category with the server name itself
const getCategoryTitle = (category: SettingsCategory) => (category === SettingsCategory.General ? room.name : category);
const openedCategories = ref([...SettingsCategories]);
const onClick = (settingsType: SettingsType) => {
  if (settingsType === SettingsType.Delete) emit("open:delete");
  else modelValue.value = settingsType;
  // Close the mobile drawer after a selection (no-op on desktop where the drawer is permanent)
  isDrawerOpen.value = false;
};
</script>

<template>
  <MessageModelSettingsLeftSideBar v-model:open="isDrawerOpen">
    <v-list v-model:opened="openedCategories">
      <v-list-group v-for="{ category, settingsTypes } of visibleCategories" :key="category" :value="category">
        <template #activator="{ props: activatorProps }">
          <v-list-item :="activatorProps">
            <v-list-item-title font-bold op-60 uppercase text-body-small>
              {{ getCategoryTitle(category) }}
            </v-list-item-title>
          </v-list-item>
        </template>
        <StyledSlideIndicator v-if="settingsTypes.includes(modelValue)" :active-keys="[modelValue]" />
        <MessageModelRoomSettingsLeftSideBarItem
          v-for="settingsType of settingsTypes"
          :key="settingsType"
          :color="SettingsListItemMap[settingsType].color"
          :data-slide-indicator-key="settingsType"
          :icon="SettingsListItemMap[settingsType].icon"
          :is-active="settingsType === modelValue"
          :settings-type
          @click="onClick"
        />
      </v-list-group>
      <v-divider my-2 />
      <MessageModelRoomSettingsLeftSideBarItem
        :color="SettingsListItemMap[SettingsType.Delete].color"
        :icon="SettingsListItemMap[SettingsType.Delete].icon"
        :is-active="false"
        :settings-type="SettingsType.Delete"
        @click="onClick"
      />
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>

<style scoped>
/* Positioning context for the StyledSlideIndicator rail. */
:deep(.v-list-group__items) {
  position: relative;
}
</style>
