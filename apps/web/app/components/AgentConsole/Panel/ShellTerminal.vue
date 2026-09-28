<script setup lang="ts">
import type { FitAddon } from "@xterm/addon-fit";

import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleShellStore } from "@/store/agentConsole/shell";
import { noop } from "@esposter/shared";
import { CommandType } from "agent-console-server/contracts";

interface Props {
  shellId: string;
}

const { shellId } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleShellStore = useAgentConsoleShellStore();
const { listenToShell } = agentConsoleShellStore;
const container = useTemplateRef("container");
const fitAddon = shallowRef<FitAddon>();
let dispose = noop;
// The terminal fills the space it is given, and the shell is told each new size so a full-screen program redraws to it
useResizeObserver(container, () => {
  fitAddon.value?.fit();
});
// Xterm.js is loaded when a shell is first shown, so the console's own chunk carries none of it
onMounted(async () => {
  const [{ Terminal }, { FitAddon: FitAddonClass }] = await Promise.all([
    import("@xterm/xterm"),
    import("@xterm/addon-fit"),
    import("@xterm/xterm/css/xterm.css"),
  ]);
  if (!container.value) return;
  const terminal = new Terminal({ cursorBlink: true });
  const newFitAddon = new FitAddonClass();
  terminal.loadAddon(newFitAddon);
  terminal.open(container.value);
  terminal.onData((data) => {
    sendCommand({ data, shellId, type: CommandType.ShellInput });
  });
  terminal.onResize(({ cols, rows }) => {
    sendCommand({ cols, rows, shellId, type: CommandType.ShellResize });
  });
  const stopListening = listenToShell(shellId, {
    reset: () => {
      terminal.reset();
    },
    write: (data) => {
      terminal.write(data);
    },
  });
  fitAddon.value = markRaw(newFitAddon);
  newFitAddon.fit();
  terminal.focus();
  dispose = () => {
    stopListening();
    terminal.dispose();
  };
});

onUnmounted(() => {
  dispose();
});
</script>

<template>
  <div ref="container" of-hidden />
</template>
