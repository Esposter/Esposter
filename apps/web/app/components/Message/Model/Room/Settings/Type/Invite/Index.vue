<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToken } from "@/models/ui/UiToken";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { data: session } = await useAuthSession();
const { hasMore, items, readMoreRoomInvites, readRoomInvites } = useReadRoomInvites(room.id);

await readRoomInvites();
</script>

<!-- Discord's invites panel: what the list is, beside the two things done to it, over one row per live link -->
<template>
  <div flex flex-col gap-4>
    <div flex gap-2 items-center>
      <p text-muted flex-1 min-w-0>Every active invite link in this room. Revoke any one, or create one of your own.</p>
      <MessageModelRoomSettingsTypeInviteCreateButton :room-id="room.id" />
      <MessageModelRoomSettingsTypeInvitePauseToggle :room />
    </div>
    <UiAlert v-if="room.isInvitePaused" :status="UiToken.Warning">Invites to this room are currently paused.</UiAlert>
    <div v-if="items.length > 0" role="list" aria-label="Invites" flex flex-col>
      <MessageModelRoomInviteRow
        v-for="invite of items"
        :key="invite.id"
        :invite
        :is-creator="invite.userId === session?.user.id"
        :room-id="room.id"
      />
    </div>
    <!-- A page of lapsed links filters down to nothing while older usable ones are still to come, so the
         empty state waits until the walk is over rather than announcing itself between pages -->
    <UiEmptyState
      v-else-if="!hasMore"
      description="Feeling aimless? Like a paper plane drifting through the skies? Get some friends in here by creating an invite link!"
      :meaning="UiIconMeaning.Send"
      title="No invites yet"
    />
    <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreRoomInvites(onComplete)" />
    <MessageModelRoomInviteConfirmRevokeDialog :room-id="room.id" />
  </div>
</template>
