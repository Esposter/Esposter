<script setup lang="ts">
import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { useDialogStore } from "@/store/message/room/dialog";
import { RoutePath } from "@esposter/shared";

interface InviteListItemProps {
  invite: InviteInMessage;
  roomId: RoomInMessage["id"];
}

const { invite, roomId } = defineProps<InviteListItemProps>();
const runtimeConfig = useRuntimeConfig();
const dialogStore = useDialogStore();
const { inviteRoomId } = storeToRefs(dialogStore);
const inviteLink = computed(() => `${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite(invite.id)}`);
const remainingUsesText = computed(() => {
  if (!invite.maxUses) return "Unlimited uses";
  const remainingUses = invite.maxUses - invite.uses;
  return `${remainingUses} ${pluralize("use", remainingUses)} remaining`;
});
</script>

<template>
  <v-list-item>
    <v-list-item-title font-mono>{{ invite.id }}</v-list-item-title>
    <v-list-item-subtitle>
      {{ remainingUsesText }} ·
      <template v-if="invite.expiresAt"> expires <NuxtTime :datetime="invite.expiresAt" relative /> </template>
      <template v-else>never expires</template>
    </v-list-item-subtitle>
    <template #append>
      <StyledClipboardIconButton :source="inviteLink" text="Copy Invite Link" />
      <StyledTooltipIconButton icon="mdi-pencil" text="Edit invite link" @click="inviteRoomId = roomId" />
    </template>
  </v-list-item>
</template>
