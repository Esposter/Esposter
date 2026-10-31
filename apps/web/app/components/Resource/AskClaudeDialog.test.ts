// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceAskClaudeDialog from "@/components/Resource/AskClaudeDialog.vue";
import { LOCAL_HOST_ADDRESS } from "@/services/agentConsole/constants";
import { apiKeyList } from "@/services/auth/authClient.test";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("resourceAskClaudeDialog", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // Nothing is sent while no host is paired, so the pairing steps are all the dialog offers and no line form is shown
  test("pairing is explained when no host is paired", async () => {
    expect.hasAssertions();

    apiKeyList.mockResolvedValue({ data: { apiKeys: [] }, error: null });
    await mountSuspended(ResourceAskClaudeDialog, {
      attachTo: document.body,
      props: { modelValue: true, resource: createResourceListItem() },
    });

    expect(document.body.textContent).toContain("Open the agent console");
    expect(document.body.querySelector("form")).toBeNull();
  });

  test("the steps to connect a key are shown when none holds the scope", async () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    agentConsoleConnectionStore.connections = [
      {
        address: LOCAL_HOST_ADDRESS,
        credential: crypto.randomUUID(),
        id: crypto.randomUUID(),
        publicKey: crypto.randomUUID(),
      },
    ];
    apiKeyList.mockResolvedValue({ data: { apiKeys: [{ permissions: null }] }, error: null });
    await mountSuspended(ResourceAskClaudeDialog, {
      attachTo: document.body,
      props: { modelValue: true, resource: createResourceListItem() },
    });
    await flushPromises();

    expect(document.body.textContent).toContain("Create an API key with the Resources scope");
    expect(document.body.querySelector("form")).toBeNull();
  });
});
