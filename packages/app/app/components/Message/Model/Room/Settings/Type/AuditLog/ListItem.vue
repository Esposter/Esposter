<script setup lang="ts">
import type { ModerationLogEntity } from "@esposter/db-schema";

import { AUTOMOD_USER_ID } from "#shared/services/message/moderation/AUTOMOD_USER_ID";
import { AdminActionColorMap } from "@/services/message/moderation/AdminActionColorMap";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { useMemberStore } from "@/store/message/user/member";
import { formatDuration } from "@/util/text/formatDuration";

interface AuditLogListItemProps {
  item: ModerationLogEntity;
}

const { item } = defineProps<AuditLogListItemProps>();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const memberNameById = computed(() => new Map(members.value.map(({ id, name }) => [id, name])));
// The actor may be the reserved AutoMod id (word-filter warn/timeout) — render it as "AutoMod".
const getActorLabel = (userId: string) =>
  userId === AUTOMOD_USER_ID ? "AutoMod" : (memberNameById.value.get(userId) ?? userId);
const getMemberLabel = (userId: string) => memberNameById.value.get(userId) ?? userId;
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-icon :color="AdminActionColorMap[item.type]">{{ AdminActionIconMap[item.type] }}</v-icon>
    </template>
    <v-list-item-title>
      {{ item.type }} — {{ getActorLabel(item.actorUserId) }} acted on {{ getMemberLabel(item.targetUserId) }}
    </v-list-item-title>
    <v-list-item-subtitle v-if="item.durationMs">{{ formatDuration(item.durationMs) }}</v-list-item-subtitle>
  </v-list-item>
</template>
