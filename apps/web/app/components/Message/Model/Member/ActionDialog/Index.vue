<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { MemberDialogType } from "@/models/message/user/MemberDialogType";
import { AdminActionType } from "@esposter/db-schema";

interface Props {
  displayName: string;
  roomId: string;
  user: Pick<User, "id">;
}

// The dialog one of a member's actions opened. The row mounts this only while one is open, so closing it is clearing
// Which one it is
const type = defineModel<MemberDialogType>("type");
const { displayName, roomId, user } = defineProps<Props>();
const isOpen = computed({
  get: () => Boolean(type.value),
  set: (newIsOpen) => {
    if (!newIsOpen) type.value = undefined;
  },
});
</script>

<template>
  <MessageModelMemberActionDialogConfirm
    v-if="type === MemberDialogType.Ban"
    v-model="isOpen"
    :text="`Are you sure you want to ban ${displayName}?`"
    :title="`Ban ${displayName}`"
    :type="AdminActionType.CreateBan"
    :user
  />
  <MessageModelMemberActionDialogConfirm
    v-else-if="type === MemberDialogType.SoftBan"
    v-model="isOpen"
    :text="`Are you sure you want to soft-ban ${displayName}? They will be kicked and their recent messages deleted, but can rejoin via invite.`"
    :title="`Soft ban ${displayName}`"
    :type="AdminActionType.SoftBan"
    :user
  />
  <MessageModelMemberActionDialogConfirm
    v-else-if="type === MemberDialogType.Kick"
    v-model="isOpen"
    :text="`Are you sure you want to kick ${displayName}?`"
    :title="`Kick ${displayName}`"
    :type="AdminActionType.KickFromRoom"
    :user
  />
  <MessageModelMemberActionDialogTimeout
    v-else-if="type === MemberDialogType.Timeout"
    v-model="isOpen"
    :display-name
    :user
  />
  <MessageModelMemberActionDialogWarn v-else-if="type === MemberDialogType.Warn" v-model="isOpen" :display-name :user />
  <MessageModelMemberActionDialogNotes
    v-else-if="type === MemberDialogType.Notes"
    v-model="isOpen"
    :display-name
    :room-id
    :user
  />
</template>
