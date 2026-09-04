<script setup lang="ts">
import type { BanInMessageWithRelations } from "@esposter/db-schema";

import { useBanStore } from "@/store/message/user/ban";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  ban: BanInMessageWithRelations;
  roomId: string;
}

const { ban, roomId } = defineProps<Props>();
const banStore = useBanStore();
const { deleteBan } = banStore;
</script>

<template>
  <v-list-item>
    <template #prepend>
      <StyledAvatar :image="ban.user.image" :name="ban.user.name" />
    </template>
    <v-list-item-title>{{ ban.user.name }}</v-list-item-title>
    <v-list-item-subtitle>
      Banned on
      <NuxtTime :datetime="ban.createdAt" day="numeric" hour="numeric" minute="2-digit" month="short" year="numeric" />
      <template v-if="ban.bannedByUser"> by {{ ban.bannedByUser.name }}</template>
    </v-list-item-subtitle>
    <template #append>
      <StyledDeleteFormDialog
        :card-props="{ title: 'Unban User' }"
        :confirm-button-props="{ text: 'Unban' }"
        @delete="
          async (onComplete) => {
            await withFinalizerAsync(() => deleteBan({ roomId, userId: ban.userId }), onComplete);
          }
        "
      >
        <template #activator="{ updateIsOpen }">
          <StyledTooltipIconButton
            :button-props="{ color: 'error', size: 'small', variant: 'text' }"
            icon="mdi-account-check-outline"
            text="Unban"
            :tooltip-props="{ location: 'top' }"
            @click.stop="updateIsOpen(true)"
          />
        </template>
        Are you sure you want to unban {{ ban.user.name }}?
      </StyledDeleteFormDialog>
    </template>
  </v-list-item>
</template>
