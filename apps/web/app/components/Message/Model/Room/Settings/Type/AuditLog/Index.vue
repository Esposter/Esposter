<script setup lang="ts">
import type { AdminActionType, RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
  <div py-4 flex flex-col gap-4 ui-body>
    <MessageModelRoomSettingsTypeAuditLogFilters
      v-model:type="type"
      v-model:actor-user-id="actorUserId"
      v-model:target-user-id="targetUserId"
      @update="readModerationLog()"
    />
    <UiEmptyState
      v-if="items.length === 0"
      :meaning="UiIconMeaning.Recent"
      :title="type || actorUserId || targetUserId ? 'No audit log entries match the filters.' : 'No audit log entries.'"
    />
    <div v-else role="list" aria-label="Audit log" flex flex-col>
      <MessageModelRoomSettingsTypeAuditLogListItem v-for="item of items" :key="item.rowKey" :item />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreModerationLog(onComplete)" />
    </div>
  </div>
</template>
