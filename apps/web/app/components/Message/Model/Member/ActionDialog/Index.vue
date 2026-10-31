<script setup lang="ts">
import type { MemberActionDialogProps } from "@/models/message/member/MemberActionDialogProps";

import { MemberDialogType } from "@/models/message/user/MemberDialogType";
import { AdminActionType } from "@esposter/db-schema";

// The dialog one of a member's actions opened. The row mounts this only while one is open, so closing it is clearing
// Which one it is
const type = defineModel<MemberDialogType>("type");
const { displayName, roomId, user } = defineProps<MemberActionDialogProps>();
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
  <MessageModelMemberActionDialogConfirm
    v-else-if="type === MemberDialogType.Warn"
    v-model="isOpen"
    :text="`Are you sure you want to warn ${displayName}? They will see a warning, and it is recorded in the audit log.`"
    :title="`Warn ${displayName}`"
    :type="AdminActionType.Warn"
    :user
  />
  <MessageModelMemberActionDialogTimeout
    v-else-if="type === MemberDialogType.Timeout"
    v-model="isOpen"
    :display-name
    :user
  />
  <MessageModelMemberActionDialogNotes
    v-else-if="type === MemberDialogType.Notes"
    v-model="isOpen"
    :display-name
    :room-id
    :user
  />
  <MessageModelMemberActionDialogDisplayName
    v-else-if="type === MemberDialogType.DisplayName"
    v-model="isOpen"
    :display-name
    :room-id
    :user
  />
</template>
