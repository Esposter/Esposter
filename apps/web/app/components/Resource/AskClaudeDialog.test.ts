// @vitest-environment nuxt
import { McpScope } from "#shared/models/auth/McpScope";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceAskClaudeDialog from "@/components/Resource/AskClaudeDialog.vue";
import { apiKeyList } from "@/services/auth/authClient.test";
import { getAssistantPrompt } from "@/services/resource/getAssistantPrompt";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("resourceAskClaudeDialog", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("the steps to connect a key are shown when none holds the scope", async () => {
    expect.hasAssertions();

    apiKeyList.mockResolvedValue({ data: { apiKeys: [{ permissions: null }] }, error: null });
    await mountSuspended(ResourceAskClaudeDialog, {
      attachTo: document.body,
      props: { modelValue: true, resource: createResourceListItem() },
    });
    await flushPromises();

    expect(document.body.textContent).toContain("Create an API key with the Resources scope");
    expect(document.body.querySelector("input")).toBeNull();
  });

  test("the prompt naming the resource is offered for copying once a line is typed", async () => {
    expect.hasAssertions();

    apiKeyList.mockResolvedValue({ data: { apiKeys: [{ permissions: { mcp: [McpScope.Resources] } }] }, error: null });
    const resource = createResourceListItem();
    await mountSuspended(ResourceAskClaudeDialog, { attachTo: document.body, props: { modelValue: true, resource } });
    await flushPromises();
    const input = document.body.querySelector("input");
    if (!input) throw new Error(" ");

    expect(document.body.querySelector("code")).toBeNull();

    input.value = "a";
    input.dispatchEvent(new Event("input"));
    await flushPromises();

    expect(document.body.querySelector("code")?.textContent).toBe(getAssistantPrompt(resource, "a"));
  });
});
