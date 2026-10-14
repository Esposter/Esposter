<script setup lang="ts">
import type { BanInMessageWithUsers } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface Props {
  ban: BanInMessageWithUsers;
}

const { ban } = defineProps<Props>();
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
</script>

<template>
  <div role="listitem" flex gap-2 items-center>
    <div ui-row flex-1 min-w-0>
      <UiItemContent :image="ban.user.image" :title="getDisplayName(ban.user, ban.roomId)">
        <template #append>
          <span text-sm text-muted truncate>
            Banned
            <NuxtTime
              :datetime="ban.createdAt"
              day="numeric"
              hour="numeric"
              minute="2-digit"
              month="short"
              year="numeric"
            />
            <template v-if="ban.bannedByUser"> by {{ getDisplayName(ban.bannedByUser, ban.roomId) }}</template>
          </span>
        </template>
      </UiItemContent>
    </div>
    <MessageModelRoomSettingsTypeBansUnbanButton :user-id="ban.userId" />
  </div>
</template>
