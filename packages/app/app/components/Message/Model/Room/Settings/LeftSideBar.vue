<script setup lang="ts">
import type { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsCategories, SettingsCategory } from "@/models/message/room/SettingsCategory";
import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsCategoryMap } from "@/services/message/settings/SettingsCategoryMap";
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";
import { SettingsPermissionMap } from "@/services/message/settings/SettingsPermissionMap";
import { useRoleStore } from "@/store/message/room/role";
import { hasPermission } from "@esposter/db-schema";

interface RoomSettingsLeftSideBarProps {
  room: RoomInMessage;
}

const { room } = defineProps<RoomSettingsLeftSideBarProps>();
const modelValue = defineModel<keyof typeof SettingsContentMap>({ required: true });
const isDrawerOpen = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ "open:delete": [] }>();
const roleStore = useRoleStore();
const { getMyPermissions } = roleStore;
const myPermissions = computed(() => getMyPermissions(room.id));
// Deleting a room is guarded by ownership rather than by a permission, and a member who cannot delete it can
// Still leave it — the same row, doing the thing this reader is allowed to do
const isRoomOwner = computed(() => myPermissions.value?.isRoomOwner ?? false);
const checkIsVisible = (settingsType: SettingsType) => {
  const permission = SettingsPermissionMap[settingsType];
  if (!permission) return true;
  if (!myPermissions.value) return false;
  return hasPermission(myPermissions.value.permissions, permission, myPermissions.value.isRoomOwner);
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
// One key, but as a stable reference: a literal in the binding allocates a fresh array every render, and the
// Indicator watches what it is handed
const activeKeys = computed(() => [modelValue.value]);
const onClick = (settingsType: SettingsType) => {
  if (settingsType === SettingsType.Delete) emit("open:delete");
  else modelValue.value = settingsType;
  isDrawerOpen.value = false;
};
</script>

<template>
  <MessageModelSettingsLeftSideBar v-model:open="isDrawerOpen">
    <v-list v-model:opened="openedCategories">
      <StyledSlideIndicator :active-keys />
      <v-list-group v-for="{ category, settingsTypes } of visibleCategories" :key="category" :value="category">
        <template #activator="{ props: activatorProps }">
          <v-list-item :="activatorProps">
            <v-list-item-title font-bold op-60 uppercase text-body-small>
              {{ getCategoryTitle(category) }}
            </v-list-item-title>
          </v-list-item>
        </template>
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
        :icon="isRoomOwner ? SettingsListItemMap[SettingsType.Delete].icon : 'mdi-exit-run'"
        :is-active="false"
        :settings-type="SettingsType.Delete"
        :title="isRoomOwner ? undefined : 'Leave'"
        @click="onClick"
      />
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
