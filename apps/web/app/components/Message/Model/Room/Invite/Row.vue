<script setup lang="ts">
import type { InviteInMessageWithCreator, RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getInviteLink } from "@/services/message/room/invite/getInviteLink";
import { useRoomDialogStore } from "@/store/message/room/dialog";
import { useRoomInviteStore } from "@/store/message/room/roomInvite";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

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
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
// The cap belongs beside the count rather than in a column of its own, which is where Discord puts a bare number
const usesText = computed(() => (invite.maxUses ? `${invite.uses} / ${invite.maxUses}` : String(invite.uses)));
// Discord's column is a clock rather than a phrase — the reader is watching a link run out, and "in 2 hours"
// Neither moves nor says how far into the hour it is
const { countdown, isExpired } = useCountdown(() => invite.expiresAt);
const isRevokeOpen = ref(false);
</script>

<!-- Discord's table as one row per link: who made it, then its code, its uses and its clock at the end, and its
     actions beside it -->
<template>
  <div role="listitem" flex gap-2 items-center>
    <div ui-row flex-1 min-w-0>
      <UiItemContent :image="invite.user.image" :title="getDisplayName(invite.user, roomId)">
        <template #append>
          <code text-sm text-muted>{{ invite.id }}</code>
          <UiTooltip #default="{ activatorProps }" label="Uses">
            <span :="activatorProps" text-sm tabular-nums>{{ usesText }}</span>
          </UiTooltip>
          <UiTooltip #default="{ activatorProps }" label="Expires">
            <code :="activatorProps" :class="{ 'text-error': isExpired }" text-sm>
              <template v-if="!invite.expiresAt">Never</template>
              <template v-else-if="isExpired">Expired</template>
              <template v-else>{{ countdown }}</template>
            </code>
          </UiTooltip>
        </template>
      </UiItemContent>
    </div>
    <UiCopyButton :source="getInviteLink(runtimeConfig.public.baseUrl, invite.id)" :variant="UiButtonVariant.Quiet" />
    <!-- Editing replaces the reader's own link, so it is only offered on the row that is theirs -->
    <UiIconButton
      v-if="isCreator"
      label="Edit invite link"
      :meaning="UiIconMeaning.Edit"
      :variant="UiButtonVariant.Quiet"
      @click="inviteRoomId = roomId"
    />
    <UiIconButton
      label="Revoke invite"
      :meaning="UiIconMeaning.Delete"
      :variant="UiButtonVariant.Quiet"
      @click="isRevokeOpen = true"
    />
    <UiConfirmDialog
      v-model="isRevokeOpen"
      confirm-label="Revoke"
      title="Revoke invite"
      @confirm="
        async (onComplete) => {
          onComplete();
          await revokeInvite({ id: invite.id, roomId });
        }
      "
    >
      <p>
        Revoke <code>{{ invite.id }}</code
        >? Anyone holding the link stops being able to join with it.
      </p>
    </UiConfirmDialog>
  </div>
</template>
