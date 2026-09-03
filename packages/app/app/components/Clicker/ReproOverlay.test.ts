// @vitest-environment nuxt
import StyledDialog from "@/components/Styled/Dialog.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";

const SlowChild = defineComponent({
  async setup() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return () => h("div", "slow");
  },
});

const Wrapper = defineComponent({
  setup: () => () => [h(SlowChild), h(StyledDialog, { modelValue: true })],
});

describe("repro", () => {
  test("dialog born active inside a pending suspense", async () => {
    expect.hasAssertions();
    const errors: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map((a) => String(a instanceof Error ? a.stack : a)).join(" "));
    });
    window.addEventListener("error", (event) => errors.push(`window: ${String(event.error)}`));
    window.addEventListener("unhandledrejection", (event) => errors.push(`rejection: ${String(event.reason)}`));
    const wrapper = await mountSuspended(Wrapper, { attachTo: document.body });
    await new Promise((resolve) => setTimeout(resolve, 300));
    spy.mockRestore();
    wrapper.unmount();
    expect(errors.join("\n---\n")).toBe("NO ERRORS");
  });
});
