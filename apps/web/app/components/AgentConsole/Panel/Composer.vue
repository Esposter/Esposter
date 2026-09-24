<script setup lang="ts">
import type { Attachment } from "agent-console-server/contracts";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PermissionModeMenuItems } from "@/services/agentConsole/PermissionModeTitleMap";
import { readAttachment } from "@/services/agentConsole/readAttachment";
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
const attachments = ref<Attachment[]>([]);
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
    const attachment = await readAttachment(file);
    if (attachment) attachments.value = [...attachments.value, attachment];
  }
};
const submit = () => {
  if (!text.value && attachments.value.length === 0) return;
  const sentText = text.value;
  const sentAttachments = attachments.value;
  text.value = "";
  attachments.value = [];
  sendCommand(
    toSlashCommand(currentSessionId.value, sentText) ?? {
      attachments: sentAttachments,
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
  <UiFrame>
    <UiButton
      v-if="currentSession?.state === SessionState.Closed"
      @click="sendCommand({ sessionId: currentSessionId, type: CommandType.Resume })"
    >
      Resume this session
    </UiButton>
    <template v-else>
      <div v-if="attachments.length > 0" flex flex-wrap gap-1>
        <UiButton
          v-for="({ name }, index) of attachments"
          :key="index"
          :aria-label="`Remove ${name}`"
          @click="attachments = attachments.toSpliced(index, 1)"
        >
          {{ name }}
          <UiIcon :meaning="UiIconMeaning.Remove" />
        </UiButton>
      </div>
      <textarea
        ref="prompt"
        v-model="text"
        aria-label="Message Claude"
        max-h="[40vh]"
        placeholder="Message Claude — / for commands, paste or drop a file"
        rows="1"
        resize-none
        field-sizing-content
        ui-sunk
        @drop.prevent="attach($event.dataTransfer?.files)"
        @keydown.enter.exact="
          (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            event.preventDefault();
            submit();
          }
        "
        @paste="attach($event.clipboardData?.files)"
      />
      <UiSuggestions
        :field="prompt ?? undefined"
        :items="commandMenuItems"
        label="Slash commands"
        @select="
          (name) => {
            text = `/${name} `;
          }
        "
      />
      <div flex flex-wrap gap-2 items-center>
        <UiSelect v-model="model" :items="modelMenuItems" label="Model" />
        <UiSelect v-model="permissionMode" :items="PermissionModeMenuItems" label="Mode" />
        <UiButton v-if="isRunning" :variant="UiButtonVariant.Danger" ml-a @click="interrupt()">Stop (Esc)</UiButton>
      </div>
    </template>
  </UiFrame>
</template>
