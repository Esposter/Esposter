<script setup lang="ts">
import type { InviteInMessageWithCreator, RoomInMessage } from "@esposter/db-schema";

import { useDialogStore } from "@/store/message/room/dialog";
import { useRoomInviteStore } from "@/store/message/room/roomInvite";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

interface InviteTableRowProps {
  invite: InviteInMessageWithCreator;
  isCreator: boolean;
  roomId: RoomInMessage["id"];
}

const { invite, isCreator, roomId } = defineProps<InviteTableRowProps>();
const runtimeConfig = useRuntimeConfig();
const dialogStore = useDialogStore();
const { inviteRoomId } = storeToRefs(dialogStore);
const roomInviteStore = useRoomInviteStore();
const { revokeInvite } = roomInviteStore;
const inviteLink = computed(() => `${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite(invite.id)}`);
// The cap belongs beside the count rather than in a column of its own, which is where Discord puts a bare number
const usesText = computed(() => (invite.maxUses ? `${invite.uses} / ${invite.maxUses}` : String(invite.uses)));
</script>

<template>
  <tr>
    <td>
      <div flex gap-x-2 items-center>
        <StyledAvatar :image="invite.user.image ?? ''" :name="invite.user.name" :avatar-props="{ size: 'small' }" />
        <span>{{ invite.user.name }}</span>
      </div>
    </td>
    <td font-mono>{{ invite.id }}</td>
    <td>{{ usesText }}</td>
    <td>
      <NuxtTime v-if="invite.expiresAt" :datetime="invite.expiresAt" relative />
      <template v-else>Never</template>
    </td>
    <td>
      <div flex justify-end>
        <StyledClipboardIconButton :source="inviteLink" text="Copy Invite Link" />
        <!-- Editing replaces the reader's own link, so it is only offered on the row that is theirs -->
        <StyledTooltipIconButton
          v-if="isCreator"
          :button-props="{ size: 'small' }"
          icon="mdi-pencil"
          text="Edit invite link"
          @click="inviteRoomId = roomId"
        />
        <StyledConfirmDeleteDialogButton
          :card-props="{ title: 'Revoke Invite' }"
          @delete="
            async (onComplete) => {
              await withFinalizerAsync(() => revokeInvite({ id: invite.id, roomId }), onComplete);
            }
          "
        >
          Revoke {{ invite.id }}? Anyone holding the link stops being able to join with it.
        </StyledConfirmDeleteDialogButton>
      </div>
    </td>
  </tr>
</template>
