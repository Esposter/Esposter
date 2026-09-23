// @vitest-environment nuxt
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useAgentConsoleConnectionStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("refuses a pasted address that is not a WebSocket URL instead of retrying it forever", () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const { hostUrl, status } = storeToRefs(agentConsoleConnectionStore);
    const { pair } = agentConsoleConnectionStore;
    pair("a");

    expect(status.value).toBe(ConnectionStatus.Unpaired);
    expect(hostUrl.value).toBe("");
  });
});
