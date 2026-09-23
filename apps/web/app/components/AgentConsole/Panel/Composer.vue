<script setup lang="ts">
import type { ImageAttachment } from "agent-console-server/contracts";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PermissionModeMenuItems } from "@/services/agentConsole/PermissionModeTitleMap";
import { readImageAttachment } from "@/services/agentConsole/readImageAttachment";
import { toSlashCommand } from "@/services/agentConsole/toSlashCommand";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, PermissionMode, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { capabilities, currentSession, currentSessionId, sessionSettings, sessionState } =
  storeToRefs(agentConsoleSessionStore);
const text = ref("");
const prompt = useTemplateRef("prompt");
const images = ref<ImageAttachment[]>([]);
// The palette lists the session's own commands — the person's skills and plugins included — while the input is a
// Bare slash command still being typed
const commandMenuItems = computed(() => {
  if (!text.value.startsWith("/") || text.value.includes(" ")) return [];
  const commandPrefix = text.value.slice(1);
  return (
    capabilities.value?.commands
      .filter(({ name }) => name.startsWith(commandPrefix))
      .map(({ argumentHint, description, name }) => ({
        description,
        title: `/${name} ${argumentHint}`,
        value: name,
      })) ?? []
  );
});
const modelMenuItems = computed(
  () => capabilities.value?.models.map(({ displayName, value }) => ({ title: displayName, value })) ?? [],
);
const isRunning = computed(() =>
  [SessionState.Compacting, SessionState.RequiresAction, SessionState.Running].includes(
    sessionState.value ?? SessionState.Idle,
  ),
);
// The session's settings are what the host last reported; choosing another asks the host, whose report moves these
const model = computed({
  get: () => sessionSettings.value?.model ?? "",
  set: (newModel) => {
    sendCommand({ model: newModel, sessionId: currentSessionId.value, type: CommandType.SetModel });
  },
});
const permissionMode = computed({
  get: () => sessionSettings.value?.permissionMode ?? PermissionMode.Default,
  set: (newPermissionMode) => {
    sendCommand({
      permissionMode: newPermissionMode,
      sessionId: currentSessionId.value,
      type: CommandType.SetPermissionMode,
    });
  },
});
const attach = async (files: FileList | undefined) => {
  for (const file of files ?? []) {
    const image = await readImageAttachment(file);
    if (image) images.value = [...images.value, image];
  }
};
const submit = () => {
  if (!text.value && images.value.length === 0) return;
  const sentText = text.value;
  const sentImages = images.value;
  text.value = "";
  images.value = [];
  sendCommand(
    toSlashCommand(currentSessionId.value, sentText) ?? {
      images: sentImages,
      sessionId: currentSessionId.value,
      text: sentText,
      type: CommandType.Prompt,
    },
  );
};
const interrupt = () => {
  if (isRunning.value) sendCommand({ sessionId: currentSessionId.value, type: CommandType.Interrupt });
};
// The terminal's one key for stopping a turn, and its only job here
onKeyStroke("Escape", () => {
  interrupt();
});
</script>

<template>
  <AgentConsolePanelFrame>
    <AgentConsolePanelButton
      v-if="currentSession?.state === SessionState.Closed"
      @click="sendCommand({ sessionId: currentSessionId, type: CommandType.Resume })"
    >
      Resume this session
    </AgentConsolePanelButton>
    <template v-else>
      <div v-if="images.length > 0" flex flex-wrap gap-1>
        <AgentConsolePanelButton
          v-for="({ mediaType }, index) of images"
          :key="index"
          :aria-label="`Remove ${mediaType}`"
          @click="images = images.toSpliced(index, 1)"
        >
          {{ mediaType }}
          <UiIcon :meaning="UiIconMeaning.Remove" />
        </AgentConsolePanelButton>
      </div>
      <textarea
        ref="prompt"
        v-model="text"
        aria-label="Message Claude"
        field-sizing-content
        max-h="[40vh]"
        placeholder="Message Claude — / for commands, paste or drop an image"
        rows="1"
        @drop.prevent="attach($event.dataTransfer?.files)"
        @keydown.enter.exact.prevent="submit()"
        @paste="attach($event.clipboardData?.files)"
      />
      <AgentConsolePanelPopover
        v-if="commandMenuItems.length > 0"
        placement="top-start"
        :reference="prompt ?? undefined"
      >
        <AgentConsolePanelMenu
          :items="commandMenuItems"
          label="Slash commands"
          min-h-0
          @select="
            (name) => {
              text = `/${name} `;
              prompt?.focus();
            }
          "
        />
      </AgentConsolePanelPopover>
      <div flex flex-wrap gap-2 items-center>
        <AgentConsolePanelSelect v-model="model" :items="modelMenuItems" label="Model" />
        <AgentConsolePanelSelect v-model="permissionMode" :items="PermissionModeMenuItems" label="Mode" />
        <AgentConsolePanelButton v-if="isRunning" is-danger ml-a @click="interrupt()"
          >Stop (Esc)</AgentConsolePanelButton
        >
      </div>
    </template>
  </AgentConsolePanelFrame>
</template>
