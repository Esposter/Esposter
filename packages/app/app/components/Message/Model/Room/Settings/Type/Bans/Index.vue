<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { useRoleStore } from "@/store/message/room/role";
import { useBanStore } from "@/store/message/user/ban";
import { RoomPermission } from "@esposter/db-schema";

interface BansProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<BansProps>();
const roleStore = useRoleStore();
const { myPermissionsMap } = storeToRefs(roleStore);
const isPermitted = computed(() => {
  const data = myPermissionsMap.value.get(roomId);
  if (!data) return false;
  return hasPermission(data.permissions, RoomPermission.BanMembers, data.isRoomOwner);
});

const { readBans, readMoreBans } = useReadBans(roomId);
const banStore = useBanStore();
const { hasMore, items } = storeToRefs(banStore);
const { deleteBan } = banStore;

if (isPermitted.value) await readBans();
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
                  @click="deleteBan({ roomId, userId })"
                />
              </template>
            </v-tooltip>
          </template>
        </v-list-item>
        <StyledWaypoint :is-active="hasMore" @change="readMoreBans" />
      </v-list>
    </template>
  </div>
</template>
