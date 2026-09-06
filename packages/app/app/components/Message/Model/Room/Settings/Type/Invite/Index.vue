<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomDialogStore } from "@/store/message/room/dialog";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const roomDialogStore = useRoomDialogStore();
const { inviteRoomId } = storeToRefs(roomDialogStore);
const { hasMore, items, readMoreRoomInvites, readRoomInvites } = useReadRoomInvites(room.id);
const saveRoom = useSaveRoom(() => room);

await readRoomInvites();
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Invites</div>
        <div text-hint>
          Here's a list of all active invite links in this room. You can revoke any one or
          <StyledActionLink @click="inviteRoomId = room.id">create one</StyledActionLink>.
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div flex gap-3 items-center>
          <StyledButton
            v-if="room.isInvitePaused"
            :button-props="{ text: 'Enable Invites', variant: 'flat' }"
            @click="saveRoom({ isInvitePaused: false })"
          />
          <!-- A plain `v-btn`, not `StyledButton`: the shell paints `--midnight-bloom` as a background *image*,
               which a `color` sets underneath rather than replaces, so an error-coloured one renders the same
               gradient as the primary beside it and the pair stops reading as opposites -->
          <v-btn v-else color="error" text="Pause Invites" variant="flat" @click="saveRoom({ isInvitePaused: true })" />
          <div v-if="room.isInvitePaused" flex gap-2 items-center text-body-small>
            <v-icon color="warning" icon="mdi-alert-circle" size="small" />
            Invites to this room are currently paused.
          </div>
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
