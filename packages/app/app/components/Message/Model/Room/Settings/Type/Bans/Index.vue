<script setup lang="ts">
import type { BanWithRelations, Room } from "@esposter/db-schema";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface BansProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<BansProps>();
const { $trpc } = useNuxtApp();
const roleStore = useRoleStore();
const { myPermissionsMap } = storeToRefs(roleStore);
const isPermitted = computed(() => {
  const data = myPermissionsMap.value.get(roomId);
  if (!data) return false;
  return hasPermission(data.permissions, RoomPermission.BanMembers, data.isRoomOwner);
});

const items = ref<BanWithRelations[]>([]);
const hasMore = ref(false);
const nextCursor = ref<string | undefined>(undefined);
const isLoadingMore = ref(false);

const LIMIT = 50;

const fetchBans = async (cursor?: string) => $trpc.moderation.readBans.query({ cursor, limit: LIMIT, roomId });

const loadMore = async () => {
  if (!nextCursor.value) return;
  isLoadingMore.value = true;
  const result = await fetchBans(nextCursor.value);
  items.value = [...items.value, ...result.items];
  hasMore.value = result.hasMore;
  nextCursor.value = result.nextCursor;
  isLoadingMore.value = false;
};

const unban = async (userId: string) => {
  await $trpc.moderation.unbanUser.mutate({ roomId, userId });
  items.value = items.value.filter((ban) => ban.userId !== userId);
};

if (isPermitted.value) {
  const initial = await fetchBans();
  items.value = initial.items;
  hasMore.value = initial.hasMore;
  nextCursor.value = initial.nextCursor;
}
</script>

<template>
  <div flex flex-col gap-4>
    <div v-if="!isPermitted" text-medium-emphasis>Insufficient permissions to view bans.</div>
    <template v-else>
      <div v-if="items.length === 0" text-medium-emphasis>No banned users.</div>
      <v-list v-else lines="two">
        <v-list-item v-for="{ bannedByUserId, createdAt, user, userId } of items" :key="userId">
          <template #prepend>
            <StyledAvatar :image="user.image" :name="user.name" />
          </template>
          <v-list-item-title>{{ user.name }}</v-list-item-title>
          <v-list-item-subtitle>
            Banned on {{ new Date(createdAt).toLocaleString() }}
            <template v-if="bannedByUserId"> by {{ bannedByUserId }}</template>
          </v-list-item-subtitle>
          <template #append>
            <v-tooltip location="top" text="Unban">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  color="error"
                  icon="mdi-account-check-outline"
                  size="small"
                  variant="text"
                  @click="unban(userId)"
                />
              </template>
            </v-tooltip>
          </template>
        </v-list-item>
      </v-list>
      <div v-if="hasMore" flex justify-center>
        <v-btn :loading="isLoadingMore" variant="tonal" @click="loadMore">Load more</v-btn>
      </div>
    </template>
  </div>
</template>
