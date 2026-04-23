<script setup lang="ts">
import type { ModerationLogEntity, Room } from "@esposter/db-schema";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { useRoleStore } from "@/store/message/room/role";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";

interface AuditLogProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<AuditLogProps>();
const { $trpc } = useNuxtApp();
const roleStore = useRoleStore();
const { myPermissionsMap } = storeToRefs(roleStore);
const isPermitted = computed(() => {
  const data = myPermissionsMap.value.get(roomId);
  if (!data) return false;
  return hasPermission(data.permissions, RoomPermission.ManageRoom, data.isRoomOwner);
});

const items = ref<ModerationLogEntity[]>([]);
const hasMore = ref(false);
const nextCursor = ref<string | undefined>(undefined);
const isLoadingMore = ref(false);

const LIMIT = 50;

const actionIconMap: Record<AdminActionType, string> = {
  [AdminActionType.BanUser]: "mdi-account-cancel",
  [AdminActionType.ForceMute]: "mdi-microphone-off",
  [AdminActionType.ForceUnmute]: "mdi-microphone",
  [AdminActionType.KickFromRoom]: "mdi-account-remove",
  [AdminActionType.KickFromVoice]: "mdi-headset-off",
  [AdminActionType.TimeoutUser]: "mdi-clock-alert-outline",
};

const actionColorMap: Record<AdminActionType, string> = {
  [AdminActionType.BanUser]: "error",
  [AdminActionType.ForceMute]: "warning",
  [AdminActionType.ForceUnmute]: "success",
  [AdminActionType.KickFromRoom]: "error",
  [AdminActionType.KickFromVoice]: "warning",
  [AdminActionType.TimeoutUser]: "warning",
};

const fetchLog = async (cursor?: string) => $trpc.moderation.readModerationLog.query({ cursor, limit: LIMIT, roomId });

const loadMore = async () => {
  if (!nextCursor.value) return;
  isLoadingMore.value = true;
  const result = await fetchLog(nextCursor.value);
  items.value = [...items.value, ...result.items];
  hasMore.value = result.hasMore;
  nextCursor.value = result.nextCursor;
  isLoadingMore.value = false;
};

if (isPermitted.value) {
  const initial = await fetchLog();
  items.value = initial.items;
  hasMore.value = initial.hasMore;
  nextCursor.value = initial.nextCursor;
}
</script>

<template>
  <div flex flex-col gap-4>
    <div v-if="!isPermitted" text-medium-emphasis>Insufficient permissions to view the audit log.</div>
    <template v-else>
      <div v-if="items.length === 0" text-medium-emphasis>No audit log entries.</div>
      <v-list v-else lines="two">
        <v-list-item v-for="entry of items" :key="entry.rowKey">
          <template #prepend>
            <v-icon :color="actionColorMap[entry.type]">{{ actionIconMap[entry.type] }}</v-icon>
          </template>
          <v-list-item-title>
            {{ entry.type }} — {{ entry.actorId }} acted on {{ entry.targetUserId }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <template v-if="entry.durationMs"> · {{ Math.round(entry.durationMs / 60000) }} min</template>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <div v-if="hasMore" flex justify-center>
        <v-btn :loading="isLoadingMore" variant="tonal" @click="loadMore">Load more</v-btn>
      </div>
    </template>
  </div>
</template>
