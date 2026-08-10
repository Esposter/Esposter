<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { useBanStore } from "@/store/message/user/ban";
import { withFinalizerAsync } from "@esposter/shared";

interface BansProps {
  room: RoomInMessage;
}

const { room } = defineProps<BansProps>();
const { readBans, readMoreBans } = useReadBans(room.id);
const banStore = useBanStore();
const { hasMore, items } = storeToRefs(banStore);
const { deleteBan } = banStore;

await readBans();
</script>

<template>
  <div flex flex-col gap-4>
    <div v-if="items.length === 0" op-medium-emphasis>No banned users.</div>
    <v-list v-else lines="two">
      <v-list-item v-for="{ bannedByUser, createdAt, user, userId } of items" :key="userId">
        <template #prepend>
          <StyledAvatar :image="user.image" :name="user.name" />
        </template>
        <v-list-item-title>{{ user.name }}</v-list-item-title>
        <v-list-item-subtitle>
          Banned on {{ dayjs(createdAt).format("MMM D, YYYY h:mm A") }}
          <template v-if="bannedByUser"> by {{ bannedByUser.name }}</template>
        </v-list-item-subtitle>
        <template #append>
          <StyledDeleteFormDialog
            :card-props="{ title: 'Unban User' }"
            :confirm-button-props="{ text: 'Unban' }"
            @delete="
              async (onComplete) => {
                await withFinalizerAsync(() => deleteBan({ roomId: room.id, userId }), onComplete);
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
            Are you sure you want to unban {{ user.name }}?
          </StyledDeleteFormDialog>
        </template>
      </v-list-item>
      <StyledWaypoint :is-active="hasMore" @change="readMoreBans" />
    </v-list>
  </div>
</template>
