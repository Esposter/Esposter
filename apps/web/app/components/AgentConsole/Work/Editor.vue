<script setup lang="ts">
import type { ImageAttachment } from "agent-console-server/contracts";

import { readImageAttachment } from "@/services/agentConsole/readImageAttachment";
import { toSlashCommand } from "@/services/agentConsole/toSlashCommand";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { capabilities, currentSession, currentSessionId } = storeToRefs(agentConsoleSessionStore);
const text = ref("");
const images = ref<ImageAttachment[]>([]);
// The palette lists the session's own commands — the person's skills and plugins included — while the input is a
// Bare slash command still being typed
const displayCommands = computed(() => {
  if (!text.value.startsWith("/") || text.value.includes(" ")) return [];
  const commandPrefix = text.value.slice(1);
  return capabilities.value?.commands.filter(({ name }) => name.startsWith(commandPrefix)) ?? [];
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
</script>

<template>
  <div v-if="currentSessionId" py-2 flex flex-col gap-2 w-full>
    <StyledButton
      v-if="currentSession?.state === SessionState.Closed"
      :button-props="{ prependIcon: 'mdi-play', text: 'Resume this session' }"
      @click="sendCommand({ sessionId: currentSessionId, type: CommandType.Resume })"
    />
    <template v-else>
      <v-list v-if="displayCommands.length > 0" density="compact" max-h="[40vh]" of-y-auto>
        <v-list-item
          v-for="{ argumentHint, description, name } of displayCommands"
          :key="name"
          :subtitle="description"
          :title="`/${name} ${argumentHint}`"
          @click="text = `/${name} `"
        />
      </v-list>
      <div v-if="images.length > 0" flex gap-1>
        <v-chip
          v-for="(image, index) of images"
          :key="index"
          closable
          prepend-icon="mdi-image"
          size="small"
          @click:close="images = images.toSpliced(index, 1)"
        >
          {{ image.mediaType }}
        </v-chip>
      </div>
      <v-textarea
        v-model="text"
        auto-grow
        max-rows="12"
        placeholder="Message Claude — / for commands, paste or drop an image"
        rows="1"
        @drop.prevent="attach($event.dataTransfer?.files)"
        @keydown.enter.exact.prevent="submit()"
        @paste="attach($event.clipboardData?.files)"
      />
    </template>
  </div>
</template>
