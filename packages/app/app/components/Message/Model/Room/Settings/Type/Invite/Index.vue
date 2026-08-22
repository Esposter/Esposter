<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useDialogStore } from "@/store/message/room/dialog";
import { useInviteStore } from "@/store/message/room/invite";
import { useRoleStore } from "@/store/message/room/role";
import { hasPermission, RoomPermission } from "@esposter/db-schema";

interface InvitesProps {
  room: RoomInMessage;
}

const { room } = defineProps<InvitesProps>();
const dialogStore = useDialogStore();
const { inviteRoomId } = storeToRefs(dialogStore);
const inviteStore = useInviteStore();
const { invites } = storeToRefs(inviteStore);
const invite = computed(() => invites.value.get(room.id));
const roleStore = useRoleStore();
const { getMyPermissions } = roleStore;
const myPermissions = computed(() => getMyPermissions(room.id));
// Pausing is a write to the room row, so only the members who may write one are shown the control
const hasManageRoom = computed(() => {
  if (!myPermissions.value) return false;
  return hasPermission(myPermissions.value.permissions, RoomPermission.ManageRoom, myPermissions.value.isRoomOwner);
});
const saveRoom = useSaveRoom(() => room);
// The panel reads without ever mounting the manager, so landing here shows the link a member already holds and
// Mints nothing — creating is the dialog's, reached by the link in the copy below
useReadMyInvite(room.id);
</script>

<!-- Discord's Invites panel, wording included: the links themselves, with creating spelled as a link into the
     dialog that does it. Ours lists the one link a member may hold rather than the room's whole set, and revoking
     one is the read and write we do not have yet — see /docs/proposals/esbabbler/invite-management -->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Invites</div>
        <div op-medium-emphasis text-body-small>
          Here's a list of all active invite links. You can revoke any one or
          <StyledActionLink @click="inviteRoomId = room.id">create one</StyledActionLink>.
        </div>
      </v-col>
    </v-row>
    <v-row v-if="hasManageRoom">
      <v-col cols="12">
        <StyledButton
          :button-props="{
            color: 'error',
            text: room.isInvitePaused ? 'Resume Invites' : 'Pause Invites',
            variant: 'flat',
          }"
          @click="saveRoom({ isInvitePaused: !room.isInvitePaused })"
        />
        <div v-if="room.isInvitePaused" pt-2 op-medium-emphasis text-body-small>
          Invites are paused. Nobody can join with a link, and no new ones can be created, until you resume.
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-table v-if="invite" density="comfortable">
          <thead>
            <tr>
              <th>Inviter</th>
              <th>Invite Code</th>
              <th>Uses</th>
              <th>Expires</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <MessageModelRoomInviteTableRow :invite :room-id="room.id" />
          </tbody>
        </v-table>
        <StyledEmptyState
          v-else
          icon="mdi-send-outline"
          title="No invites yet"
          description="Feeling aimless? Like a paper plane drifting through the skies? Get some friends in here by creating an invite link!"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
