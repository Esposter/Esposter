<script setup lang="ts">
import type { MemberDialogType } from "@/models/message/user/MemberDialogType";
import type { UiItem } from "@/models/ui/UiItem";
import type { RoomInMessage, User } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { MEMBER_PROFILE_POSITION_AREA } from "@/services/message/member/constants";
import { getTopRole } from "@/services/message/member/getTopRole";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useStatusStore } from "@/store/message/user/status";

interface Props {
  member: Pick<User, "id" | "image" | "name">;
  room: RoomInMessage;
}

// What trails the row's name, such as a picker's mark for adding the member
defineSlots<{ append?: () => VNode }>();
const { member, room } = defineProps<Props>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
const displayName = computed(() => getDisplayName(member, room.id));
const roleStore = useRoleStore();
const { getMemberRoles } = roleStore;
const statusStore = useStatusStore();
const { getStatusMessage } = statusStore;
// Discord tints the display name with the member's top role color
const topRoleColor = computed(() => getTopRole(getMemberRoles(room.id, member.id))?.color || undefined);
const isProfileOpen = ref(false);
const openedDialogType = ref<MemberDialogType>();
const { copyUserIdItem, friendItem, moderationItems } = useMemberActionItems(
  () => member,
  () => room.id,
  (type) => {
    openedDialogType.value = type;
  },
);
const { getContextMenuProps } = useContextMenu();
// Everything the profile offers, and the profile itself, which the row opens on a click as well
const getContextMenuItems = (): UiItem[] => [
  {
    meaning: UiIconMeaning.Person,
    onClick: () => {
      isProfileOpen.value = true;
    },
    title: "Profile",
  },
  ...(friendItem.value ? [friendItem.value] : []),
  copyUserIdItem,
  ...moderationItems.value,
];
</script>

<template>
  <li>
    <!-- @TODO: a row of a UiList cannot be a popover's trigger yet, so the row is the popover's own quiet button -->
    <UiPopover
      v-model:is-open="isProfileOpen"
      :label="room.userId === member.id ? `${displayName}, room owner` : displayName"
      :position-area="MEMBER_PROFILE_POSITION_AREA"
      :variant="UiButtonVariant.Quiet"
      :="getContextMenuProps(member.id, () => getContextMenuItems())"
      w-full
      @click="emit('click', $event)"
    >
      <template #trigger>
        <MessageModelMemberStatusAvatar :id="member.id" :image="member.image" :name="displayName" />
        <span text-left flex-1 min-w-0 truncate>
          <span :style="{ color: topRoleColor }">{{ displayName }}</span>
          <span v-if="getStatusMessage(member.id)" text-sm text-muted> {{ getStatusMessage(member.id) }}</span>
        </span>
        <span v-if="room.userId === member.id" class="i-mdi:crown" aria-hidden="true" text-warning size-6 />
        <slot name="append" />
      </template>
      <MessageModelUserProfileCard v-if="isProfileOpen" :user="member" @open:dialog="openedDialogType = $event" />
    </UiPopover>
    <MessageModelMemberActionDialog
      v-if="openedDialogType"
      v-model:type="openedDialogType"
      :display-name
      :room-id="room.id"
      :user="member"
    />
  </li>
</template>
