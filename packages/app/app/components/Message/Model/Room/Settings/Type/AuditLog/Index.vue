<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { AdminActionType, RoomInMessage } from "@esposter/db-schema";

import { AdminActionColorMap } from "@/services/message/moderation/AdminActionColorMap";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { useModerationLogStore } from "@/store/message/moderation/log";
import { useMemberStore } from "@/store/message/user/member";
import { formatDuration } from "@/util/text/formatDuration";
import { AdminActionTypes } from "@esposter/db-schema";

interface AuditLogProps {
  room: RoomInMessage;
}

const { room } = defineProps<AuditLogProps>();
const type = ref<"" | AdminActionType>("");
const actorUserId = ref("");
const targetUserId = ref("");
const filters = computed(() => ({
  actorUserId: actorUserId.value,
  targetUserId: targetUserId.value,
  type: type.value,
}));
const hasFilters = computed(() => Boolean(type.value || actorUserId.value || targetUserId.value));
const { readModerationLog, readMoreModerationLog } = useReadModerationLog(room.id, filters);
const moderationLogStore = useModerationLogStore();
const { hasMore, items } = storeToRefs(moderationLogStore);
const { readMembers } = useReadMembers();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
// "" = unfiltered ("All …") — clearable is avoided since it emits null
const memberItems = computed<SelectItemCategoryDefinition<string>[]>(() => [
  { title: "All members", value: "" },
  ...members.value.map(({ id, name }) => ({ title: name, value: id })),
]);
const adminActionTypeItems = [
  { title: "All actions", value: "" },
  ...AdminActionTypes.map((adminActionType) => ({
    props: { prependIcon: AdminActionIconMap[adminActionType] },
    title: adminActionType,
    value: adminActionType,
  })),
];

await Promise.all([readModerationLog(), readMembers()]);
</script>

<template>
  <div flex flex-col gap-4>
    <div flex gap-2>
      <v-select
        v-model="type"
        label="Action"
        :items="adminActionTypeItems"
        density="compact"
        hide-details
        @update:model-value="readModerationLog"
      />
      <v-select
        v-model="actorUserId"
        label="Actor"
        :items="memberItems"
        density="compact"
        hide-details
        @update:model-value="readModerationLog"
      />
      <v-select
        v-model="targetUserId"
        label="Target"
        :items="memberItems"
        density="compact"
        hide-details
        @update:model-value="readModerationLog"
      />
    </div>
    <div v-if="items.length === 0" op-medium-emphasis>
      {{ hasFilters ? "No audit log entries match the filters." : "No audit log entries." }}
    </div>
    <v-list v-else lines="two">
      <v-list-item
        v-for="{
          actorUserId: entryActorUserId,
          durationMs,
          rowKey,
          targetUserId: entryTargetUserId,
          type: entryType,
        } of items"
        :key="rowKey"
      >
        <template #prepend>
          <v-icon :color="AdminActionColorMap[entryType]">{{ AdminActionIconMap[entryType] }}</v-icon>
        </template>
        <v-list-item-title>{{ entryType }} — {{ entryActorUserId }} acted on {{ entryTargetUserId }}</v-list-item-title>
        <v-list-item-subtitle v-if="durationMs">{{ formatDuration(durationMs) }}</v-list-item-subtitle>
      </v-list-item>
      <StyledWaypoint :is-active="hasMore" @change="readMoreModerationLog" />
    </v-list>
  </div>
</template>
