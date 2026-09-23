<script setup lang="ts">
import type { MenuItem } from "@/models/agentConsole/MenuItem";

import { MessageActionType } from "@/models/agentConsole/MessageActionType";
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
// The files are checkpointed before each prompt's edits, so only a prompt is a point they rewind to
const items = computed<MenuItem<MessageActionType>[]>(() => [
  { title: "Copy", value: MessageActionType.Copy },
  { description: "into a new session", title: "Fork", value: MessageActionType.Fork },
  { description: "the conversation to here", title: "Rewind", value: MessageActionType.Rewind },
  ...(isPrompt
    ? [{ description: "to before this prompt", title: "Rewind files", value: MessageActionType.RewindFiles }]
    : []),
]);
const isOpen = ref(false);
const actions = useTemplateRef("actions");

onClickOutside(actions, () => {
  isOpen.value = false;
});
</script>

<template>
  <!-- One quiet mark over the message's corner rather than a row of buttons under it, so it takes no room of its -->
  <!-- Own; what it can do opens from it -->
  <div
    ref="actions"
    class="actions"
    :class="{ 'op-100': isOpen || copied }"
    op-0
    right-0
    top-0
    absolute
    group-focus-within:op-100
    group-hover:op-100
  >
    <button
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      aria-label="Message actions"
      class="trigger"
      px-1
      cursor-pointer
      hover:brightness-150
      type="button"
      @click="isOpen = !isOpen"
    >
      {{ copied ? "Copied" : "⋯" }}
    </button>
    <AgentConsolePanelPopover v-if="isOpen" placement="bottom-end" :reference="actions ?? undefined">
      <AgentConsolePanelMenu
        :items
        label="Message actions"
        min-h-0
        @keydown.escape.stop="isOpen = false"
        @select="
          (value) => {
            isOpen = false;
            if (value === MessageActionType.Copy) copy(text);
            else sendCommand({ messageUuid, sessionId: currentSessionId, type: MessageActionCommandTypeMap[value] });
          }
        "
      />
    </AgentConsolePanelPopover>
  </div>
</template>

<style scoped>
/* Where nothing hovers, the mark stays shown, since a hover would be the only way to find it */
@media (hover: none) {
  .actions {
    opacity: 1;
  }
}

/* Doubled so it outranks the page's rule that gives every button the text colour; the panel's own colour under it
   Keeps it legible over the text it floats on */
.trigger.trigger {
  background-color: var(--agent-console-panel);
  color: var(--agent-console-muted);
}
</style>
