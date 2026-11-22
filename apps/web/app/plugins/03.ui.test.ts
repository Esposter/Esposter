// @vitest-environment nuxt
import uiPlugin from "#src/plugins/03.ui";
import { createNuxtApp } from "nuxt/app";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createApp } from "vue";

describe("ui plugin", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("a server-rendered app's breakpoints read the screen once its first suspense resolves", async () => {
    expect.hasAssertions();

    vi.stubGlobal("innerWidth", 1280);
    const vueApp = createApp({ render: () => null });
    const nuxtApp = createNuxtApp({ vueApp });
    nuxtApp.payload.serverRendered = true;
    await nuxtApp.runWithContext(() => uiPlugin(nuxtApp));
    await nuxtApp.callHook("app:suspense:resolve");
    const { smAndUp } = vueApp.runWithContext(() => useUiDisplay());

    expect(smAndUp.value).toBe(true);
  });
});
