<script setup lang="ts">
import type { ModerationLogInRoom } from "#shared/models/db/room/ModerationLogInRoom";

import { AdminActionColorMap } from "@/services/message/moderation/AdminActionColorMap";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { formatDuration } from "@/util/date/formatDuration";
import { AUTOMOD_USER_ID } from "@esposter/db-schema";

interface Props {
  item: ModerationLogInRoom;
}

const { item } = defineProps<Props>();
// The actor may be the reserved AutoMod id (word-filter warn/timeout) — render it as "AutoMod".
const actorLabel = computed(() => (item.actorUserId === AUTOMOD_USER_ID ? "AutoMod" : item.actorDisplayName));
</script>

<template>
  <div role="listitem" ui-row>
    <UiItemContent
      :description="item.durationMs ? formatDuration(item.durationMs) : undefined"
      :title="`${item.type} — ${actorLabel} acted on ${item.targetDisplayName}`"
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
