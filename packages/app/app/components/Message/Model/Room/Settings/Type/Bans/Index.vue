<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { useBanStore } from "@/store/message/user/ban";

interface BansProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<BansProps>();
const { readBans, readMoreBans } = useReadBans(roomId);
const banStore = useBanStore();
const { hasMore, items } = storeToRefs(banStore);
const { deleteBan } = banStore;

await readBans();
</script>

<template>
  <div flex flex-col gap-4>
    <div v-if="items.length === 0" text-medium-emphasis>No banned users.</div>
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
            :card-props="{ title: 'Unban User', text: `Are you sure you want to unban ${user.name}?` }"
            :confirm-button-props="{ color: 'primary', text: 'Unban' }"
            @delete="
              async (onComplete) => {
                try {
                  await deleteBan({ roomId, userId });
                } finally {
                  onComplete();
                }
              }
            "
          >
            <template #activator="{ updateIsOpen }">
              <v-tooltip location="top" text="Unban">
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    :="tooltipProps"
                    color="error"
                    icon="mdi-account-check-outline"
                    size="small"
                    variant="text"
                    @click.stop="updateIsOpen(true)"
                  />
                </template>
              </v-tooltip>
            </template>
          </StyledDeleteFormDialog>
        </template>
      </v-list-item>
      <StyledWaypoint :is-active="hasMore" @change="readMoreBans" />
    </v-list>
  </div>
</template>
