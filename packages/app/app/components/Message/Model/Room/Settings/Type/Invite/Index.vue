<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDialogStore } from "@/store/message/room/dialog";

interface InvitesProps {
  room: RoomInMessage;
}

const { room } = defineProps<InvitesProps>();
const { data: session } = await authClient.useSession(useFetch);
const dialogStore = useDialogStore();
const { inviteRoomId } = storeToRefs(dialogStore);
const { hasMore, items, readMoreRoomInvites, readRoomInvites } = useReadRoomInvites(room.id);
const saveRoom = useSaveRoom(() => room);

// The panel is gated on ManageRoom, so anyone who reaches it may act on every row it lists — the pause below and
// The revokes beside each link are the same authority
await readRoomInvites();
</script>

<!-- Discord's Invites panel, wording included: the room's active links, with creating spelled as a link into the
     dialog that does it — creating stays where the want is -->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Invites</div>
        <div op-medium-emphasis text-body-small>
          Here's a list of all active invite links in this room. You can revoke any one or
          <StyledActionLink @click="inviteRoomId = room.id">create one</StyledActionLink>.
        </div>
      </v-col>
    </v-row>
    <v-row>
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
        <v-table v-if="items.length > 0" density="comfortable">
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
            <MessageModelRoomInviteTableRow
              v-for="invite of items"
              :key="invite.id"
              :invite
              :is-creator="invite.userId === session?.user.id"
              :room-id="room.id"
            />
          </tbody>
        </v-table>
        <!-- A page of lapsed links filters down to nothing while older usable ones are still to come, so the
             empty state waits until the walk is over rather than announcing itself between pages -->
        <StyledEmptyState
          v-else-if="!hasMore"
          icon="mdi-send-outline"
          title="No invites yet"
          description="Feeling aimless? Like a paper plane drifting through the skies? Get some friends in here by creating an invite link!"
        />
        <StyledWaypoint :is-active="hasMore" @change="readMoreRoomInvites" />
      </v-col>
    </v-row>
  </v-container>
</template>
