<script setup lang="ts">
import type { InviteRecipient } from "@/models/message/room/invite/InviteRecipient";
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useInviteStore } from "@/store/message/room/invite";

interface Props {
  isInviteSendable: boolean;
  // Which friends are already members is read once for the whole list, so each row looks its own id up in it
  memberIdSet: Set<string>;
  recipient: InviteRecipient;
  room: RoomInMessage;
}

const { isInviteSendable, memberIdSet, recipient, room } = defineProps<Props>();
const directMessageStore = useDirectMessageStore();
const { checkIsInviteDirectMessagePending, checkIsInviteFriendPending, inviteDirectMessage, inviteFriend } =
  directMessageStore;
const inviteStore = useInviteStore();
const { getUsableInviteLink } = inviteStore;
const checkIsRecipientPending = ({ id, isGroup }: InviteRecipient) =>
  isGroup ? checkIsInviteDirectMessagePending(id) : checkIsInviteFriendPending(id);
</script>

<template>
  <MessageFriendsUserListItem :image="recipient.image" :name="recipient.name">
    <template #append>
      <UiButton v-if="memberIdSet.has(recipient.id)" disabled>Joined</UiButton>
      <!-- The invite can lapse or run out of uses while the dialog is open, so the send rechecks it and mints a fresh one
      Before a link is sent -->
      <UiButton
        v-else
        :disabled="!isInviteSendable"
        :is-pending="checkIsRecipientPending(recipient)"
        :variant="UiButtonVariant.Accent"
        @click="
          async () => {
            const inviteLink = await getUsableInviteLink(room);
            if (!inviteLink) return;
            if (recipient.isGroup) await inviteDirectMessage(recipient.id, inviteLink);
            else await inviteFriend(recipient.id, inviteLink);
          }
        "
      >
        Invite
      </UiButton>
    </template>
  </MessageFriendsUserListItem>
</template>
