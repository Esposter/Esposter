// @vitest-environment nuxt
import AgentConsoleMarkdown from "@/components/AgentConsole/Markdown.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleFileStore } from "@/store/agentConsole/file";
import { useAgentConsolePaneStore } from "@/store/agentConsole/pane";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { CommandType } from "agent-console-server/contracts";
import { describe, expect, test, vi } from "vitest";

describe(AgentConsoleMarkdown, () => {
  test("opens a link to a page of the app in the side pane, and leaves an anchor on this page to the browser", async () => {
    expect.hasAssertions();

    const agentConsolePaneStore = useAgentConsolePaneStore();
    const { currentPagePath, pagePaths } = storeToRefs(agentConsolePaneStore);
    const component = await mountSuspended(AgentConsoleMarkdown, {
      props: { source: `[page](${window.location.origin}/docs?a=1) [anchor](#heading)` },
    });
    await component.get('a[href="#heading"]').trigger("click");

    expect(pagePaths.value).toStrictEqual([]);

    await component.get('a[href$="/docs?a=1"]').trigger("click");

    expect(currentPagePath.value).toBe("/docs?a=1");
  });

  test("opens an anchor on this page under another query in the side pane", async () => {
    expect.hasAssertions();

    const agentConsolePaneStore = useAgentConsolePaneStore();
    const { currentPagePath } = storeToRefs(agentConsolePaneStore);
    const pagePath = `${window.location.pathname}?b=2`;
    const component = await mountSuspended(AgentConsoleMarkdown, {
      props: { source: `[anchor](${pagePath}#heading)` },
    });
    await component.get("a").trigger("click");

    expect(currentPagePath.value).toBe(pagePath);
  });

  test("opens a known repository path from prose or a code block", async () => {
    expect.hasAssertions();

    const path = "src/index.ts";
    const agentConsoleFileStore = useAgentConsoleFileStore();
    agentConsoleFileStore.storeFiles([path]);
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    agentConsoleSessionStore.currentSessionId = "session";
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const sendCommand = vi.spyOn(agentConsoleConnectionStore, "sendCommand");
    const component = await mountSuspended(AgentConsoleMarkdown, {
      props: { source: `${path}\n\n\`\`\`\n${path}\n\`\`\`` },
    });
    const links = component.findAll('a[href="#agent-console-file"]');

    await links[0]?.trigger("click");
    await links[1]?.trigger("click");

    expect(sendCommand).toHaveBeenCalledTimes(2);
    expect(sendCommand).toHaveBeenNthCalledWith(1, { path, sessionId: "session", type: CommandType.ReadFile });
    expect(sendCommand).toHaveBeenNthCalledWith(2, { path, sessionId: "session", type: CommandType.ReadFile });
  });
});
