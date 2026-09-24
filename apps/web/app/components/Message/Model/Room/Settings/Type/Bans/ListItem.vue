<script setup lang="ts">
import type { BanInMessageWithUsers } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useBanStore } from "@/store/message/user/ban";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  ban: BanInMessageWithUsers;
  roomId: string;
}

const { ban, roomId } = defineProps<Props>();
const banStore = useBanStore();
const { deleteBan } = banStore;
const isUnbanOpen = ref(false);
</script>

<template>
  <div role="listitem" flex gap-2 items-center>
    <div ui-row flex-1 min-w-0>
      <UiItemContent :image="ban.user.image" :title="ban.user.name">
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
            <template v-if="ban.bannedByUser"> by {{ ban.bannedByUser.name }}</template>
          </span>
        </template>
      </UiItemContent>
    </div>
    <UiButton :variant="UiButtonVariant.Quiet" @click="isUnbanOpen = true">Unban</UiButton>
    <UiConfirmDialog
      v-model="isUnbanOpen"
      confirm-label="Unban"
      title="Unban user"
      @confirm="
        async (onComplete) => {
          await withFinalizerAsync(() => deleteBan({ roomId, userId: ban.userId }), onComplete);
        }
      "
    >
      <p>Are you sure you want to unban {{ ban.user.name }}?</p>
    </UiConfirmDialog>
  </div>
</template>
