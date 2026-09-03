// @vitest-environment nuxt
import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createVuetify } from "vuetify";
import { VDialog } from "vuetify/components";

const SlowChild = defineComponent({
  async setup() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return () => h("div", "slow");
  },
});

const Wrapper = defineComponent({
  setup: () => () => [h(SlowChild), h(VDialog, { modelValue: true }, { default: () => h("div", "content") })],
});

describe.each([true, false])("repro ssr=%s", (ssr) => {
  test("dialog born active inside a pending suspense", async () => {
    expect.hasAssertions();
    const errors: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map((a) => String(a instanceof Error ? a.stack : a)).join(" "));
    });
    window.addEventListener("unhandledrejection", (event) => errors.push(`rejection: ${String(event.reason)}`));
    const wrapper = mount(defineComponent({ setup: () => () => h(Suspense, null, { default: () => h(Wrapper) }) }), {
      attachTo: document.body,
      global: { plugins: [createVuetify({ ssr })] },
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
    spy.mockRestore();
    wrapper.unmount();
    expect(errors.join("\n---\n")).toBe("NO ERRORS");
  });
});
