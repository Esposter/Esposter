<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface InvitesProps {
  room: RoomInMessage;
}

const { room } = defineProps<InvitesProps>();
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Invite Link</div>
        <div op-medium-emphasis text-body-small>
          Share your invite link to bring people into the room. Each member has one live invite link — changing its
          options replaces it.
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomInviteManager :room-id="room.id" />
      </v-col>
    </v-row>
  </v-container>
</template>
