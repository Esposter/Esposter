<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { AdminActionColorMap } from "@/services/message/moderation/AdminActionColorMap";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { useModerationLogStore } from "@/store/message/moderation/log";

interface AuditLogProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<AuditLogProps>();
const { readModerationLog, readMoreModerationLog } = useReadModerationLog(roomId);
const moderationLogStore = useModerationLogStore();
const { hasMore, items } = storeToRefs(moderationLogStore);

await readModerationLog();
</script>

<template>
  <div flex flex-col gap-4>
    <div v-if="items.length === 0" text-medium-emphasis>No audit log entries.</div>
    <v-list v-else lines="two">
      <v-list-item v-for="{ actorUserId, durationMs, rowKey, targetUserId, type } of items" :key="rowKey">
        <template #prepend>
          <v-icon :color="AdminActionColorMap[type]">{{ AdminActionIconMap[type] }}</v-icon>
        </template>
        <v-list-item-title>{{ type }} — {{ actorUserId }} acted on {{ targetUserId }}</v-list-item-title>
        <v-list-item-subtitle>
          <template v-if="durationMs"> · {{ Math.round(durationMs / 60000) }} min</template>
        </v-list-item-subtitle>
      </v-list-item>
      <StyledWaypoint :is-active="hasMore" @change="readMoreModerationLog" />
    </v-list>
  </div>
</template>
