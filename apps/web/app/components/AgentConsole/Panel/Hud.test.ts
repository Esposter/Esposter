// @vitest-environment nuxt
import AgentConsolePanelHud from "@/components/AgentConsole/Panel/Hud.vue";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { RouterLink } from "vue-router";

describe(AgentConsolePanelHud, () => {
  // The page has no dock, so the bar's link is the one way out a pointer or a touch can see
  test("links home", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(AgentConsolePanelHud, { global: { components: { RouterLink } } });

    expect(component.get('a[aria-label="Leave to the app"]').attributes("href")).toBe(RoutePath.Index);
  });
});
