<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { MessageActionType } from "@/models/agentConsole/MessageActionType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { MessageActionCommandTypeMap } from "@/services/agentConsole/MessageActionCommandTypeMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

interface Props {
  isPrompt?: true;
  messageUuid: string;
  text: string;
}

const { isPrompt, messageUuid, text } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
const { copied, copy } = useClipboard({ legacy: true });
// One quiet mark over the message's corner rather than a row of buttons under it, so it takes no room of its own;
// What it can do opens from it
// The files are checkpointed before each prompt's edits, so only a prompt is a point they rewind to
const items = computed<UiMenuItem<MessageActionType>[]>(() => [
  { title: "Copy", value: MessageActionType.Copy },
  { description: "into a new session", title: "Fork", value: MessageActionType.Fork },
  { description: "the conversation to here", title: "Rewind", value: MessageActionType.Rewind },
  ...(isPrompt
    ? [{ description: "to before this prompt", title: "Rewind files", value: MessageActionType.RewindFiles }]
    : []),
]);
</script>

<template>
  <div
    :class="{ 'op-100': copied }"
    class="actions"
    op-0
    right-0
    top-0
    absolute
    group-focus-within:op-100
    group-hover:op-100
  >
    <UiMenu
      :items
      label="Message actions"
      :variant="UiButtonVariant.Quiet"
      @select="
        (value) => {
          if (value === MessageActionType.Copy) copy(text);
          else sendCommand({ messageUuid, sessionId: currentSessionId, type: MessageActionCommandTypeMap[value] });
        }
      "
    >
      <template v-if="copied">Copied</template>
      <UiIcon v-else :meaning="UiIconMeaning.More" />
    </UiMenu>
  </div>
</template>

<style scoped>
/* Where nothing hovers, the mark stays shown, since a hover would be the only way to find it */
@media (hover: none) {
  .actions {
    opacity: 1;
  }
}
</style>
