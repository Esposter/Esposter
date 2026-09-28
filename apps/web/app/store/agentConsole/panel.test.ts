// @vitest-environment nuxt
import { AGENT_CONSOLE_ID } from "@/services/agentConsole/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(useAgentConsolePanelStore, () => {
  const sheet = document.createElement("section");
  const composer = document.createElement("textarea");

  beforeEach(() => {
    setActivePinia(createPinia());
    sheet.id = AGENT_CONSOLE_ID;
    sheet.append(composer);
    document.body.append(sheet);
  });

  afterEach(() => {
    sheet.remove();
    sessionStorage.clear();
  });

  test("gives the keys to the world while focus is out of the open console, and to the console while it is in", async () => {
    expect.hasAssertions();

    const agentConsolePanelStore = useAgentConsolePanelStore();
    const { isConsoleOpen, isWorldActive } = storeToRefs(agentConsolePanelStore);
    isConsoleOpen.value = true;
    composer.focus();
    await nextTick();

    expect(isWorldActive.value).toBe(false);

    composer.blur();
    await nextTick();

    expect(isWorldActive.value).toBe(true);
  });
});
