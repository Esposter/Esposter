<script setup lang="ts">
import type { InviteInMessageWithCreator, RoomInMessage } from "@esposter/db-schema";

import { useRoomDialogStore } from "@/store/message/room/dialog";
import { useRoomInviteStore } from "@/store/message/room/roomInvite";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

interface Props {
  invite: InviteInMessageWithCreator;
  isCreator: boolean;
  roomId: RoomInMessage["id"];
}

const { invite, isCreator, roomId } = defineProps<Props>();
const runtimeConfig = useRuntimeConfig();
const roomDialogStore = useRoomDialogStore();
const { inviteRoomId } = storeToRefs(roomDialogStore);
const roomInviteStore = useRoomInviteStore();
const { revokeInvite } = roomInviteStore;
const inviteLink = computed(() => `${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite(invite.id)}`);
// The cap belongs beside the count rather than in a column of its own, which is where Discord puts a bare number
const usesText = computed(() => (invite.maxUses ? `${invite.uses} / ${invite.maxUses}` : String(invite.uses)));
// Discord's column is a clock rather than a phrase — the reader is watching a link run out, and "in 2 hours"
// Neither moves nor says how far into the hour it is
const { countdown, isExpired } = useCountdown(() => invite.expiresAt);
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
    <td font-mono>
      <template v-if="!invite.expiresAt">Never</template>
      <template v-else-if="isExpired">Expired</template>
      <template v-else>{{ countdown }}</template>
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
