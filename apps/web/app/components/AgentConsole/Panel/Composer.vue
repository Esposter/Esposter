<script setup lang="ts">
import type { Attachment } from "agent-console-server/contracts";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PermissionModeMenuItems } from "@/services/agentConsole/PermissionModeMenuItems";
import { readAttachment } from "@/services/agentConsole/readAttachment";
import { toPromptCommand } from "@/services/agentConsole/toPromptCommand";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleFileStore } from "@/store/agentConsole/file";
import { CommandType, PermissionMode, SessionState } from "agent-console-server/contracts";

interface Props {
  // The side chat's composer asks its own session, and is not the console's
  isSideChat?: true;
}

const { isSideChat } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { askSideChat, sendCommand } = agentConsoleConnectionStore;
const { capabilities, composerText, currentSession, isTurnRunning, sessionId, sessionSettings } =
  useAgentConsoleSession();
const prompt = useTemplateRef("prompt");
const attachments = ref<Attachment[]>([]);
// The palette lists the session's own commands — the person's skills and plugins included — while the input is a
// Bare slash command still being typed
const commandMenuItems = computed(() => {
  if (!composerText.value.startsWith("/") || composerText.value.includes(" ")) return [];
  const commandPrefix = composerText.value.slice(1);
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
const agentConsoleFileStore = useAgentConsoleFileStore();
const { files } = storeToRefs(agentConsoleFileStore);
// An @ with no space after it is a file being mentioned; the file list is asked of the host as the menu opens
const mentionQuery = computed(() => composerText.value.match(/(?:^|\s)@(?<mentionQuery>\S*)$/u)?.groups?.mentionQuery);
const isMentioning = computed(() => mentionQuery.value !== undefined);
const mentionMenuItems = computed(() => {
  const query = mentionQuery.value?.toLowerCase() ?? "";
  return files.value
    .filter((path) => path.toLowerCase().includes(query))
    .slice(0, 50)
    .map((path) => ({ title: path, value: path }));
});
const suggestionItems = computed(() => (isMentioning.value ? mentionMenuItems.value : commandMenuItems.value));
const suggestionLabel = computed(() => (isMentioning.value ? "Files" : "Slash commands"));
// A side chat has no session until its first question opens one, and there is no file list to ask of none
watch(isMentioning, (newIsMentioning) => {
  if (newIsMentioning && sessionId.value) sendCommand({ sessionId: sessionId.value, type: CommandType.ListFiles });
});
const selectSuggestion = (value: string) => {
  composerText.value = isMentioning.value ? composerText.value.replace(/@\S*$/u, `@${value} `) : `/${value} `;
};
const modelMenuItems = computed(
  () =>
    capabilities.value?.models.map(({ displayName, value }) => ({
      meaning: UiIconMeaning.Model,
      title: displayName,
      value,
    })) ?? [],
);
// The session's settings are what the host last reported; choosing another asks the host, whose report moves these
const model = computed({
  get: () => sessionSettings.value?.model ?? "",
  set: (newModel) => {
    sendCommand({ model: newModel, sessionId: sessionId.value, type: CommandType.SetModel });
  },
});
const permissionMode = computed({
  get: () => sessionSettings.value?.permissionMode ?? PermissionMode.Default,
  set: (newPermissionMode) => {
    sendCommand({ permissionMode: newPermissionMode, sessionId: sessionId.value, type: CommandType.SetPermissionMode });
  },
});
const attach = async (fileList: FileList | undefined) => {
  const newAttachments = await Promise.all(Array.from(fileList ?? [], (file) => readAttachment(file)));
  attachments.value = [...attachments.value, ...newAttachments.filter((attachment) => attachment !== undefined)];
};
// The text stays in the composer until the question is taken, so one refused — a side chat still opening — is not lost
const submit = () => {
  if (!composerText.value && attachments.value.length === 0) return;
  const sentText = composerText.value;
  const sentAttachments = attachments.value;
  const isSent = isSideChat
    ? askSideChat(sentText, sentAttachments)
    : sendCommand(toPromptCommand(sessionId.value, sentText, sentAttachments));
  if (!isSent) return;

  composerText.value = "";
  attachments.value = [];
};
</script>

<template>
  <UiFrame>
    <UiButton
      v-if="currentSession?.state === SessionState.Closed"
      @click="sendCommand({ sessionId: sessionId, type: CommandType.Resume })"
    >
      Resume this session
    </UiButton>
    <template v-else>
      <div v-if="attachments.length > 0" flex flex-wrap gap-1>
        <!-- Keyed by position: an attachment has no id and a file pasted twice repeats its name, and a chip holds no
             State, so a removal only relabels the chips after it and focus stays on the one sliding into its place -->
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
      <!-- eslint-disable vuejs-accessibility/no-autofocus -- the console sheet's initial focus, which the sheet moves here as it opens on a key the person pressed to type -->
      <textarea
        ref="prompt"
        v-model="composerText"
        :aria-label="isSideChat ? 'Ask the side chat' : 'Message Claude'"
        max-h="[40dvh]"
        placeholder="Message Claude — / for commands, @ for files, paste or drop a file"
        rows="1"
        autofocus
        px-2
        py-1
        resize-none
        field-sizing-content
        ui-field
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
      <!-- eslint-enable vuejs-accessibility/no-autofocus -->
      <UiSuggestions
        :field="prompt ?? undefined"
        :items="suggestionItems"
        :label="suggestionLabel"
        @select="(value) => selectSuggestion(value)"
      />
      <div flex flex-wrap gap-2 items-center>
        <!-- The settings are the session's, so a side chat with no session yet has none to choose for -->
        <template v-if="sessionId">
          <UiSelect v-model="model" :items="modelMenuItems" label="Model" />
          <UiSelect v-model="permissionMode" :items="PermissionModeMenuItems" label="Mode" />
        </template>
        <!-- The terminal's Ctrl+B: what is running keeps running in the background while the turn goes on -->
        <UiButton
          v-if="isTurnRunning"
          ml-a
          @click="sendCommand({ sessionId: sessionId, type: CommandType.BackgroundTasks })"
        >
          Background (Ctrl+B)
        </UiButton>
        <UiButton
          v-if="isTurnRunning"
          :variant="UiButtonVariant.Danger"
          @click="sendCommand({ sessionId: sessionId, type: CommandType.Interrupt })"
        >
          Stop (Esc)
        </UiButton>
      </div>
    </template>
  </UiFrame>
</template>
