import { describe, expect, test } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

describe("vitest.config", () => {
  // The app compiles the Options API out, so its tests must run the same Vue, or a component that needs it passes here
  // And throws in the app
  test("runs Vue with the Options API compiled out", async () => {
    expect.hasAssertions();

    const html = await renderToString(
      createSSRApp({
        data: () => ({ value: "value" }),
        render() {
          return h("span", (this as { value?: string }).value);
        },
      }),
    );

    expect(html).toBe("<span></span>");
  });
});
