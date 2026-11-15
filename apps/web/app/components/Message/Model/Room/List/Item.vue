<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";
import type { RoomInMessage } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { checkHasRoomDraft } from "#src/services/message/room/list/checkHasRoomDraft";
import { checkIsRoomUnread } from "#src/services/message/room/list/checkIsRoomUnread";
import { useInputStore } from "#src/store/message/input/index";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { RoomPermission } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { data: session } = await useAuthSession();
const roomName = useRoomName(() => room.id);
const inputStore = useInputStore();
const { drafts } = storeToRefs(inputStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { checkHasMyPermission, checkIsManageable } = roleStore;
const roomDialogStore = useRoomDialogStore();
const { inviteRoomId, settingsRoomId } = storeToRefs(roomDialogStore);
const isActive = computed(() => room.id === currentRoomId.value);
const hasDraft = computed(() => !isActive.value && checkHasRoomDraft([...drafts.value.keys()], room.id));
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom } = userToRoomStore;
const myUserToRoom = computed(() => getMyUserToRoom(room.id));
const hasUnread = computed(
  () => !isActive.value && myUserToRoom.value !== undefined && checkIsRoomUnread(myUserToRoom.value, room),
);
const mentionCount = computed(() => (isActive.value ? 0 : (myUserToRoom.value?.mentionCount ?? 0)));
const isSettingsVisible = computed(() => room.userId === session.value?.user.id || checkIsManageable(room.id));
const openSettings = () => {
  settingsRoomId.value = room.id;
};
// Discord's channel menu, cut to what this room can do: inviting where the reader may mint a link, and its settings
// Where the reader may change them — the same settings the row's own button opens
const contextMenuItems = computed<Item[]>(() => [
  ...(checkHasMyPermission(room.id, RoomPermission.ManageInvites)
    ? [
        {
          meaning: UiIconMeaning.Invite,
          onClick: () => {
            inviteRoomId.value = room.id;
          },
          title: "Invite people",
        },
      ]
    : []),
  ...(isSettingsVisible.value
    ? [{ meaning: UiIconMeaning.Settings, onClick: openSettings, title: "Room settings" }]
    : []),
]);
</script>

<template>
  <MessageModelRoomBaseListItem
    :context-menu-items
    :image="room.image"
    :is-active
    :is-unread="hasUnread || hasDraft ? true : undefined"
    :name="roomName"
    :room-id="room.id"
  >
    <template #append>
      <UiBadge
        v-if="mentionCount"
        :count="mentionCount"
        :label="`${mentionCount} ${pluralize('mention', mentionCount)}`"
      />
      <UiTooltip v-if="hasDraft" #default="{ activatorProps }" label="Draft">
        <UiIcon :="activatorProps" label="Draft" :meaning="UiIconMeaning.Edit" text-muted />
      </UiTooltip>
      <UiTooltip v-if="room.isReadOnly" #default="{ activatorProps }" label="Read-only">
        <UiIcon :="activatorProps" label="Read-only" :meaning="UiIconMeaning.Announcement" text-muted />
      </UiTooltip>
    </template>
    <template v-if="isSettingsVisible" #actions>
      <UiIconButton
        label="Room settings"
        :meaning="UiIconMeaning.Settings"
        :variant="UiButtonVariant.Quiet"
        @click="openSettings()"
      />
    </template>
  </MessageModelRoomBaseListItem>
</template>
