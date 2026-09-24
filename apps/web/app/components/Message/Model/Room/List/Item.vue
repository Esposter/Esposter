<script setup lang="ts">
import type { UiItem } from "@/models/ui/UiItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { getComposerTarget } from "@/services/message/composer/getComposerTarget";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { useRoomDialogStore } from "@/store/message/room/dialog";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { RoomPermission } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
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
// A thread's draft counts as the room's, because the room list is the only place either is surfaced — a reply
// Half-written in a thread pane is otherwise invisible until the drafts page is opened
const hasDraft = computed(
  () =>
    !isActive.value &&
    [...drafts.value.keys()].some((composerKey) => getComposerTarget(composerKey).roomId === room.id),
);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom } = userToRoomStore;
const myUserToRoom = computed(() => getMyUserToRoom(room.id));
const hasUnread = computed(() => {
  if (isActive.value) return false;
  const lastMessageAt = myUserToRoom.value?.lastMessageAt;
  return Boolean(lastMessageAt && lastMessageAt < room.updatedAt);
});
const mentionCount = computed(() => (isActive.value ? 0 : (myUserToRoom.value?.mentionCount ?? 0)));
const isSettingsVisible = computed(() => room.userId === session.value?.user.id || checkIsManageable(room.id));
// Discord's channel menu, cut to what this room can do: inviting where the reader may mint a link, and its settings
// Where the reader may change them — the same settings the row's own button opens
const contextMenuItems = computed<UiItem[]>(() => [
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
    ? [
        {
          meaning: UiIconMeaning.Settings,
          onClick: () => {
            settingsRoomId.value = room.id;
          },
          title: "Room settings",
        },
      ]
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
      <span
        v-if="mentionCount"
        :aria-label="`${mentionCount} mentions`"
        text-sm
        text-background
        px-1
        text-center
        bg-error
        min-w-6
        rd="[var(--ui-pill-radius)]"
      >
        {{ mentionCount }}
      </span>
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
        @click="settingsRoomId = room.id"
      />
    </template>
  </MessageModelRoomBaseListItem>
</template>
