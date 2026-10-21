<script setup lang="ts">
import type { BanInRoom } from "#shared/models/db/room/BanInRoom";

interface Props {
  ban: BanInRoom;
}

const { ban } = defineProps<Props>();
</script>

<template>
  <div role="listitem" flex gap-2 items-center>
    <div ui-row flex-1 min-w-0>
      <UiItemContent :image="ban.user.image" :title="ban.user.displayName">
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
            <template v-if="ban.bannedByUser"> by {{ ban.bannedByUser.displayName }}</template>
          </span>
        </template>
      </UiItemContent>
    </div>
    <MessageModelRoomSettingsTypeBansUnbanButton :user-id="ban.userId" />
  </div>
</template>
