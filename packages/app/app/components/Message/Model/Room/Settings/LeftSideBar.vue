<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";
import { SettingsPermissionMap } from "@/services/message/settings/SettingsPermissionMap";
import { useRoleStore } from "@/store/message/room/role";

interface LeftSideBarProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<LeftSideBarProps>();
const modelValue = defineModel<keyof typeof SettingsContentMap>({ required: true });
const emit = defineEmits<{ "open:delete": [] }>();
const roleStore = useRoleStore();
const { getMyPermissions } = roleStore;
const visibleSettings = computed(() =>
  Object.entries(SettingsListItemMap).filter(([settingsType]) => {
    const permission = SettingsPermissionMap[settingsType];
    if (!permission) return true;
    const myPermissions = getMyPermissions(roomId);
    if (!myPermissions) return false;
    return hasPermission(myPermissions.permissions, permission, myPermissions.isRoomOwner);
  }),
);
</script>

<template>
  <MessageModelSettingsLeftSideBar>
    <v-list pt-10>
      <MessageModelRoomSettingsLeftSideBarItem
        v-for="[settingsType, { color, icon }] of visibleSettings"
        :key="settingsType"
        :color
        :icon
        :is-active="settingsType === modelValue"
        :settings-type
        @click="
          (settingsType) => {
            if (settingsType === SettingsType.Delete) emit('open:delete');
            else modelValue = settingsType;
          }
        "
      />
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
