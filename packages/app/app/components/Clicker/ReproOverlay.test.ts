// @vitest-environment nuxt
import StyledDialog from "@/components/Styled/Dialog.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
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
    const errors: unknown[] = [];
    const onError = (event: PromiseRejectionEvent | ErrorEvent) => errors.push(event);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    const wrapper = await mountSuspended(Wrapper, { attachTo: document.body });
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(
      "ERRORS",
      errors.length,
      errors.map((e) => String((e as ErrorEvent).error ?? (e as PromiseRejectionEvent).reason)),
    );
    wrapper.unmount();
    expect(true).toBe(true);
  });
});
