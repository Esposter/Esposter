<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { CONTEXT_WARNING_RATIO, TOKEN_COUNT_FORMAT } from "@/services/agentConsole/constants";
import { PermissionModeTitleMap } from "@/services/agentConsole/PermissionModeTitleMap";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, PermissionMode, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const {
  capabilities,
  contextUsage,
  currentSession,
  currentSessionId,
  rateLimit,
  sessionSettings,
  sessionState,
  turnResult,
} = storeToRefs(agentConsoleSessionStore);
const permissionModes: SelectItemCategoryDefinition<PermissionMode>[] = Object.values(PermissionMode).map((value) => ({
  title: PermissionModeTitleMap[value],
  value,
}));
const models = computed<SelectItemCategoryDefinition<string>[]>(
  () => capabilities.value?.models.map(({ displayName, value }) => ({ title: displayName, value })) ?? [],
);
const isRunning = computed(() =>
  [SessionState.Compacting, SessionState.RequiresAction, SessionState.Running].includes(
    sessionState.value ?? SessionState.Idle,
  ),
);
// Warns before automatic compaction rather than at it, which is the moment a person can still choose to compact
const isContextNearCompaction = computed(() => {
  if (!contextUsage.value?.autoCompactThreshold) return false;
  return contextUsage.value.totalTokens >= contextUsage.value.autoCompactThreshold * CONTEXT_WARNING_RATIO;
});
const interrupt = () => {
  if (isRunning.value) sendCommand({ sessionId: currentSessionId.value, type: CommandType.Interrupt });
};
onKeyStroke("Escape", () => {
  interrupt();
});
</script>

<template>
  <StyledPageHeader :title="currentSession?.title || 'New session'">
    <template #status>
      <div flex gap-2 items-center>
        <v-chip v-if="sessionState" :color="SessionStateColorMap[sessionState]" size="small">{{ sessionState }}</v-chip>
        <v-tooltip v-if="contextUsage" location="bottom">
          <template #activator="{ props }">
            <v-progress-circular
              :="props"
              :color="isContextNearCompaction ? 'warning' : 'primary'"
              :model-value="contextUsage.percentage"
              size="2.25rem"
              width="4"
            >
              <span text-label-small>{{ Math.round(contextUsage.percentage) }}</span>
            </v-progress-circular>
          </template>
          {{ TOKEN_COUNT_FORMAT.format(contextUsage.totalTokens) }} of
          {{ TOKEN_COUNT_FORMAT.format(contextUsage.maxTokens) }} tokens of context
          <template v-if="contextUsage.autoCompactThreshold">
            — compacts automatically at {{ TOKEN_COUNT_FORMAT.format(contextUsage.autoCompactThreshold) }}
          </template>
        </v-tooltip>
        <v-chip v-if="turnResult" prepend-icon="mdi-currency-usd" size="small">
          {{ turnResult.totalCostUsd.toFixed(2) }}
        </v-chip>
        <v-chip
          v-if="rateLimit?.utilization !== undefined"
          :color="rateLimit.status === 'allowed' ? '' : 'warning'"
          size="small"
        >
          {{ rateLimit.rateLimitType || "Usage" }} {{ Math.round(rateLimit.utilization * 100) }}%
        </v-chip>
      </div>
    </template>
    <template #actions>
      <v-select
        :items="models"
        :model-value="sessionSettings?.model"
        density="compact"
        label="Model"
        max-w-60
        @update:model-value="
          (newModel) => sendCommand({ model: newModel, sessionId: currentSessionId, type: CommandType.SetModel })
        "
      />
      <v-select
        :items="permissionModes"
        :model-value="sessionSettings?.permissionMode ?? PermissionMode.Default"
        density="compact"
        label="Mode"
        max-w-50
        @update:model-value="
          (newPermissionMode) =>
            sendCommand({
              permissionMode: newPermissionMode,
              sessionId: currentSessionId,
              type: CommandType.SetPermissionMode,
            })
        "
      />
      <StyledTooltipIconButton
        v-if="isRunning"
        :button-props="{ color: 'error', size: 'small' }"
        icon="mdi-stop"
        text="Stop (Esc)"
        @click="interrupt()"
      />
    </template>
  </StyledPageHeader>
</template>
