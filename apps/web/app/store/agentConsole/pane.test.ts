// @vitest-environment nuxt
import { useAgentConsolePaneStore } from "@/store/agentConsole/pane";
import { afterEach, describe, expect, test } from "vitest";

describe(useAgentConsolePaneStore, () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("shows an opened page once, and moves to the last one open when the one on show closes", () => {
    expect.hasAssertions();

    const agentConsolePaneStore = useAgentConsolePaneStore();
    const { currentPagePath, isPaneOpen, pagePaths } = storeToRefs(agentConsolePaneStore);
    const { closePage, openPage } = agentConsolePaneStore;
    openPage("/resource-explorer/a");
    openPage("/resource-explorer/b");
    openPage("/resource-explorer/a");
    expect(pagePaths.value).toStrictEqual(["/resource-explorer/a", "/resource-explorer/b"]);
    expect(currentPagePath.value).toBe("/resource-explorer/a");

    closePage("/resource-explorer/a");
    expect(currentPagePath.value).toBe("/resource-explorer/b");
    closePage("/resource-explorer/b");
    expect(isPaneOpen.value).toBe(false);
  });
});
