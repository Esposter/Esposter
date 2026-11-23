<script setup lang="ts">
import type { AdminActionType, RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useModerationLogStore } from "#src/store/message/moderation/log";

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
const { isError, isPending, readModerationLog, readMoreModerationLog } = useReadModerationLog(
  room.id,
  () => filters.value,
);
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
      @update="readModerationLog()"
    />
    <UiErrorState v-if="isError" error="The audit log could not be loaded." @retry="readModerationLog()" />
    <!-- A read still out with no rows yet is the skeleton, never the empty state it has not earned -->
    <MessageFriendsListSkeleton v-else-if="isPending && items.length === 0" />
    <UiEmptyState
      v-else-if="items.length === 0"
      :meaning="UiIconMeaning.Recent"
      :title="type || actorUserId || targetUserId ? 'No audit log entries match the filters.' : 'No audit log entries.'"
    />
    <div v-else role="list" aria-label="Audit log" flex flex-col>
      <MessageModelRoomSettingsTypeAuditLogListItem v-for="item of items" :key="item.id" :item />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreModerationLog(onComplete)" />
    </div>
  </div>
</template>
