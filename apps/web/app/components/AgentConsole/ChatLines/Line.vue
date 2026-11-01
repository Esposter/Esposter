<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { CHAT_LINE_DURATION_MS } from "@/services/agentConsole/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";

interface Props {
  text: string;
}

const { text } = defineProps<Props>();
const emit = defineEmits<{ fade: [] }>();
const agentConsolePanelStore = useAgentConsolePanelStore();
const { openConsole } = agentConsolePanelStore;
const chatLineDuration = `${CHAT_LINE_DURATION_MS}ms`;
</script>

<template>
  <li class="chat-line" max-w-full @animationend="emit('fade')">
    <button
      px-2
      bg="panel/85"
      max-w-full
      cursor-pointer
      pointer-events-auto
      truncate
      type="button"
      @click="openConsole(AgentConsolePanelType.Conversation)"
    >
      {{ text }}
    </button>
  </li>
</template>

<style scoped>
/* Held, then faded out, as a game's chat line is */
.chat-line {
  animation: chat-line-fade v-bind(chatLineDuration) forwards;
}

@keyframes chat-line-fade {
  0%,
  75% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
