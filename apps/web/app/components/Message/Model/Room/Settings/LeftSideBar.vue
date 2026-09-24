<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsCategories, SettingsCategory } from "@/models/message/room/SettingsCategory";
import { SettingsType } from "@/models/message/room/SettingsType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SettingsCategoryMap } from "@/services/message/settings/SettingsCategoryMap";
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";
import { SettingsPermissionMap } from "@/services/message/settings/SettingsPermissionMap";
import { useRoleStore } from "@/store/message/room/role";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const modelValue = defineModel<keyof typeof SettingsContentMap>({ required: true });
const isDrawerOpen = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ "open:delete": [] }>();
const roleStore = useRoleStore();
const { checkHasMyPermission, getMyPermissions } = roleStore;
const myPermissions = computed(() => getMyPermissions(room.id));
// Deleting a room is guarded by ownership rather than by a permission, and a member who cannot delete it can
// Still leave it — the same row, doing the thing this reader is allowed to do
const isRoomOwner = computed(() => myPermissions.value?.isRoomOwner ?? false);
const checkIsVisible = (settingsType: SettingsType) => {
  const permission = SettingsPermissionMap[settingsType];
  if (permission) return checkHasMyPermission(room.id, permission);
  else return true;
};
// Walked through the enum's own values rather than the map's entries, which come back keyed by `string`
const visibleCategories = computed(() =>
  SettingsCategories.map((category) => ({
    category,
    items: SettingsCategoryMap[category]
      .filter((settingsType) => checkIsVisible(settingsType))
      .map<UiListItem<SettingsType>>((settingsType) => ({
        icon: SettingsListItemMap[settingsType].icon,
        isCurrent: settingsType === modelValue.value,
        title: settingsType,
        value: settingsType,
      })),
  })).filter(({ items }) => items.length > 0),
);
// Discord heads the first category with the server name itself
const getCategoryTitle = (category: SettingsCategory) => (category === SettingsCategory.General ? room.name : category);
const openedCategories = ref([...SettingsCategories]);
const onClick = (settingsType: SettingsType) => {
  if (settingsType === SettingsType.Delete) emit("open:delete");
  else modelValue.value = settingsType;
  isDrawerOpen.value = false;
};
</script>

<template>
  <MessageModelSettingsLeftSideBar v-model:open="isDrawerOpen">
    <nav aria-label="Room settings" p-2 flex flex-col gap-1 ui-body>
      <UiCollapsible
        v-for="{ category, items } of visibleCategories"
        :key="category"
        :model-value="openedCategories.includes(category)"
        @update:model-value="
          (isOpen) => {
            openedCategories = isOpen
              ? [...openedCategories, category]
              : openedCategories.filter((openedCategory) => openedCategory !== category);
          }
        "
      >
        <template #title>
          <span text-sm text-muted truncate uppercase>{{ getCategoryTitle(category) }}</span>
        </template>
        <UiList :items :label="getCategoryTitle(category)" @select="onClick" />
      </UiCollapsible>
      <div my-1 bg-divider h="[var(--ui-border-width)]" />
      <!-- The destructive row says what it does to this reader: the owner deletes the room, everyone else leaves it -->
      <button type="button" text-error ui-item @click="onClick(SettingsType.Delete)">
        <UiItemContent
          :meaning="isRoomOwner ? UiIconMeaning.Delete : UiIconMeaning.Leave"
          :title="isRoomOwner ? 'Delete room' : 'Leave room'"
        />
      </button>
    </nav>
  </MessageModelSettingsLeftSideBar>
</template>
