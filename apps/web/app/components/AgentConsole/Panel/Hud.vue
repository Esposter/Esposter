<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { RoutePath } from "@esposter/shared";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isPauseMenuOpen } = storeToRefs(agentConsolePanelStore);
const { openConsole } = agentConsolePanelStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const {
  avatar,
  contextUsage,
  currentSession,
  currentSessionId,
  isContextNearCompaction,
  pendingPermissionRequests,
  sessionState,
  turnResult,
} = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <!-- The one bar, along the foot of the world as a game's hotbar is: what describes the session and the host, then the
    Console with its key written on it, the one raised button among quiet marks, the pause menu and the way home. The
    Pause menu is the page's overflow, so a pointer or a touch opens the same list Escape does rather than a second copy
    Of it; home is out here as well as in it, since the way out is never only inside a menu. The session's words yield
    To the buttons, which never wrap -->
  <nav aria-label="Agent console" px-2 py-1 flex gap-2 items-center ui-frame>
    <div flex flex-1 gap-2 min-w-0 text-nowrap items-center of-hidden>
      <template v-if="currentSessionId">
        <span v-if="avatar" flex shrink-0 gap-2 items-center>
          <UiAvatar :name="avatar" />
          {{ avatar }}
        </span>
        <span truncate>{{ currentSession?.title || "New session" }}</span>
        <span v-if="sessionState" :style="{ color: SessionStateColorMap[sessionState] }">{{ sessionState }}</span>
        <span v-if="contextUsage" :class="{ 'text-warning': isContextNearCompaction }">
          {{ Math.round(contextUsage.percentage) }}% context
        </span>
        <span v-if="turnResult">${{ turnResult.totalCostUsd.toFixed(2) }}</span>
      </template>
      <span v-else-if="status === ConnectionStatus.Unpaired" truncate>Not paired with a host</span>
      <span v-else truncate>No session open</span>
    </div>
    <AgentConsolePanelConnectionStatus v-if="status !== ConnectionStatus.Unpaired" shrink-0 />
    <UiButton @click="openConsole(AgentConsolePanelType.Conversation)">
      <UiIcon
        v-if="pendingPermissionRequests.length > 0"
        label="A permission request is waiting"
        :meaning="UiIconMeaning.Warning"
        text-warning
      />
      Console
      <UiShortcut shortcut="t" />
    </UiButton>
    <UiIconButton
      aria-haspopup="dialog"
      label="Pause (Esc)"
      :meaning="UiIconMeaning.Pause"
      :variant="UiButtonVariant.Quiet"
      @click="isPauseMenuOpen = true"
    />
    <UiTooltip #default="{ activatorProps }" label="Leave to the app">
      <UiButtonLink
        :="activatorProps"
        :to="RoutePath.Index"
        aria-label="Leave to the app"
        :variant="UiButtonVariant.Quiet"
        px-0
      >
        <UiIcon :meaning="UiIconMeaning.Home" />
      </UiButtonLink>
    </UiTooltip>
  </nav>
</template>
