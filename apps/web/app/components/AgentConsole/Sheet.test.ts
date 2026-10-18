// @vitest-environment nuxt
import AgentConsoleSheet from "@/components/AgentConsole/Sheet.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe(AgentConsoleSheet, () => {
  test("The chord opens the side chat", async () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    agentConsoleConnectionStore.connections = [
      {
        address: "wss://a",
        credential: crypto.randomUUID(),
        deviceId: crypto.randomUUID(),
        id: crypto.randomUUID(),
        publicKey: " ",
      },
    ];
    useAgentConsolePanelStore().isConsoleOpen = true;
    useAgentConsoleSessionStore().currentSessionId = crypto.randomUUID();
    const component = await mountSuspended(AgentConsoleSheet);
    // The mount wraps the sheet, so the chord is pressed on the sheet itself, where the reader's focus is
    await component.get('[aria-label="Console"]').trigger("keydown", { ctrlKey: true, key: ";" });

    expect(useAgentConsoleSideChatStore().isSideChatOpen).toBe(true);
    expect(component.findAll('textarea[aria-label="Message Claude"]')).toHaveLength(1);
    expect(component.findAll('textarea[aria-label="Ask the side chat"]')).toHaveLength(1);
  });
});
