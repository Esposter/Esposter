<script setup lang="ts">
import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDialogStore } from "@/store/message/room/dialog";
import { useInviteStore } from "@/store/message/room/invite";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

interface InviteTableRowProps {
  invite: InviteInMessage;
  roomId: RoomInMessage["id"];
}

const { invite, roomId } = defineProps<InviteTableRowProps>();
const { data: session } = await authClient.useSession(useFetch);
const runtimeConfig = useRuntimeConfig();
const dialogStore = useDialogStore();
const { inviteRoomId } = storeToRefs(dialogStore);
const inviteStore = useInviteStore();
const { revokeInvite } = inviteStore;
const inviteLink = computed(() => `${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite(invite.id)}`);
// The cap belongs beside the count rather than in a column of its own, which is where Discord puts a bare number
const usesText = computed(() => (invite.maxUses ? `${invite.uses} / ${invite.maxUses}` : String(invite.uses)));
</script>

<template>
  <tr>
    <td>
      <div flex gap-x-2 items-center>
        <StyledAvatar
          :image="session?.user.image ?? ''"
          :name="session?.user.name ?? ''"
          :avatar-props="{ size: 'small' }"
        />
        <span>{{ session?.user.name }}</span>
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
        <StyledTooltipIconButton
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
