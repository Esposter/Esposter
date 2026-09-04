<script setup lang="ts">
import type { ModerationLogEntity } from "@esposter/db-schema";

import { AdminActionColorMap } from "@/services/message/moderation/AdminActionColorMap";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { useMemberStore } from "@/store/message/user/member";
import { formatDuration } from "@/util/date/formatDuration";
import { AUTOMOD_USER_ID } from "@esposter/db-schema";

interface Props {
  item: ModerationLogEntity;
}

const { item } = defineProps<Props>();
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
// The actor may be the reserved AutoMod id (word-filter warn/timeout) — render it as "AutoMod".
const getActorLabel = (userId: string) => (userId === AUTOMOD_USER_ID ? "AutoMod" : getMemberName(userId));
const displayDuration = computed(() => (item.durationMs ? formatDuration(item.durationMs) : ""));
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-icon :color="AdminActionColorMap[item.type]">{{ AdminActionIconMap[item.type] }}</v-icon>
    </template>
    <v-list-item-title>
      {{ item.type }} — {{ getActorLabel(item.actorUserId) }} acted on {{ getMemberName(item.targetUserId) }}
    </v-list-item-title>
    <v-list-item-subtitle v-if="item.durationMs">{{ displayDuration }}</v-list-item-subtitle>
  </v-list-item>
</template>
