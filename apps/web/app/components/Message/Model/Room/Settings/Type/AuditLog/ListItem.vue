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
</script>

<template>
  <div role="listitem" ui-row>
    <UiItemContent
      :description="item.durationMs ? formatDuration(item.durationMs) : undefined"
      :title="`${item.type} — ${getActorLabel(item.actorUserId)} acted on ${getMemberName(item.targetUserId)}`"
    >
      <!-- The action's own colour, so a glance down the log picks the bans out of the warnings -->
      <template #mark>
        <span
          :class="AdminActionIconMap[item.type]"
          :style="{ color: `var(--ui-${AdminActionColorMap[item.type]})` }"
          size-6
        />
      </template>
    </UiItemContent>
  </div>
</template>
