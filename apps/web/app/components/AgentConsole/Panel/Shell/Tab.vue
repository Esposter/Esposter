<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleShellStore } from "@/store/agentConsole/shell";
import { CommandType } from "agent-console-server/contracts";

interface Props {
  index: number;
  isShown: boolean;
  shellId: string;
}

const { index, isShown, shellId } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleShellStore = useAgentConsoleShellStore();
const { currentShellId } = storeToRefs(agentConsoleShellStore);
</script>

<template>
  <div flex items-center>
    <UiButton
      :aria-selected="isShown"
      role="tab"
      :variant="isShown ? undefined : UiButtonVariant.Quiet"
      @click="currentShellId = shellId"
    >
      Shell {{ index + 1 }}
    </UiButton>
    <UiIconButton
      :label="`Close shell ${index + 1}`"
      :meaning="UiIconMeaning.Close"
      :variant="UiButtonVariant.Quiet"
      @click="sendCommand({ shellId, type: CommandType.CloseShell })"
    />
  </div>
</template>
