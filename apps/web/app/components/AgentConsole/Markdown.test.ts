// @vitest-environment nuxt
import AgentConsoleMarkdown from "@/components/AgentConsole/Markdown.vue";
import { useAgentConsolePaneStore } from "@/store/agentConsole/pane";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

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
});
