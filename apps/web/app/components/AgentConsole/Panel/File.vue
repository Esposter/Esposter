<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useAgentConsoleFileStore } from "@/store/agentConsole/file";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useClipboardStore } from "@/store/clipboard";

const agentConsoleFileStore = useAgentConsoleFileStore();
const { closeFile } = agentConsoleFileStore;
const { openedFile } = storeToRefs(agentConsoleFileStore);
const agentConsolePanelStore = useAgentConsolePanelStore();
const { composerText } = storeToRefs(agentConsolePanelStore);
const clipboardStore = useClipboardStore();
const { copy } = clipboardStore;
// The file goes into the next prompt as the @ mention the Code tab's context menu makes, which Claude Code resolves
const attachFile = (path: string) => {
  composerText.value = `${composerText.value}${composerText.value && !composerText.value.endsWith(" ") ? " " : ""}@${path} `;
};
</script>

<template>
  <div v-if="openedFile" flex flex-col gap-2 max-h="[60dvh]" min-h-0>
    <div flex gap-2 items-center>
      <span flex-1 truncate>{{ openedFile.path }}</span>
      <UiButton @click="attachFile(openedFile.path)">Attach as context</UiButton>
      <UiButton @click="copy(openedFile.path)">Copy path</UiButton>
      <UiIconButton
        label="Close file"
        :meaning="UiIconMeaning.Close"
        :variant="UiButtonVariant.Quiet"
        @click="closeFile()"
      />
    </div>
    <p v-if="openedFile.notice" text-muted>{{ openedFile.notice }}</p>
    <pre v-else text-sm ws-pre of-auto>{{ openedFile.content }}</pre>
  </div>
</template>
