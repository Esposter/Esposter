<script setup lang="ts">
import type { AdminActionType, RoomInMessage } from "@esposter/db-schema";

import { useModerationLogStore } from "@/store/message/moderation/log";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const type = ref<"" | AdminActionType>("");
const actorUserId = ref("");
const targetUserId = ref("");
const filters = computed(() => ({
  actorUserId: actorUserId.value,
  targetUserId: targetUserId.value,
  type: type.value,
}));
const { readModerationLog, readMoreModerationLog } = useReadModerationLog(room.id, filters);
const moderationLogStore = useModerationLogStore();
const { hasMore, items } = storeToRefs(moderationLogStore);
const { readMembers } = useReadMembers();

await Promise.all([readModerationLog(), readMembers()]);
</script>

<template>
  <div flex flex-col gap-4>
    <MessageModelRoomSettingsTypeAuditLogFilters
      v-model:type="type"
      v-model:actor-user-id="actorUserId"
      v-model:target-user-id="targetUserId"
      @update="readModerationLog"
    />
    <div v-if="items.length === 0" op-medium-emphasis>
      {{ type || actorUserId || targetUserId ? "No audit log entries match the filters." : "No audit log entries." }}
    </div>
    <v-list v-else lines="two">
      <MessageModelRoomSettingsTypeAuditLogListItem v-for="item of items" :key="item.rowKey" :item />
      <StyledWaypoint :is-active="hasMore" @change="readMoreModerationLog" />
    </v-list>
  </div>
</template>
