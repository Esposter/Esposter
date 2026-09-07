// @vitest-environment nuxt
import type { Ref } from "vue";

import { useFocusWhenActive } from "@/composables/message/slashCommand/useFocusWhenActive";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";

const createInputComponent = (isActive: Ref<boolean>) =>
  defineComponent({
    setup() {
      const input = useTemplateRef<HTMLInputElement>("input");
      useFocusWhenActive(input, isActive);
      return () => h("input", { ref: "input" });
    },
  });

describe(useFocusWhenActive, () => {
  test("focuses the input that is already active when it mounts", () => {
    expect.hasAssertions();

    const component = mount(createInputComponent(ref(true)), { attachTo: window.document.body });

    expect(window.document.activeElement).toBe(component.element);
  });

  test("focuses the input once it becomes active", async () => {
    expect.hasAssertions();

    const isActive = ref(false);
    const component = mount(createInputComponent(isActive), { attachTo: window.document.body });

    expect(window.document.activeElement).not.toBe(component.element);

    isActive.value = true;
    await nextTick();

    expect(window.document.activeElement).toBe(component.element);
  });
});
