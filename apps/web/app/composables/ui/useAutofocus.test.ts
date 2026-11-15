// @vitest-environment happy-dom

import { useAutofocus } from "@/composables/ui/useAutofocus";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

const createInputComponent = (isEnabled: Ref<boolean>) =>
  defineComponent({
    setup() {
      const input = useTemplateRef<HTMLInputElement>("input");
      useAutofocus(input, isEnabled);
      return () => h("input", { ref: "input" });
    },
  });

describe(useAutofocus, () => {
  afterEach(() => {
    window.document.body.innerHTML = "";
  });

  test("focuses the element when it mounts", async () => {
    expect.hasAssertions();

    const component = mount(createInputComponent(ref(true)), { attachTo: window.document.body });
    await flushPromises();

    expect(window.document.activeElement).toBe(component.element);
  });

  test("focuses the element once it is wanted", async () => {
    expect.hasAssertions();

    const isEnabled = ref(false);
    const component = mount(createInputComponent(isEnabled), { attachTo: window.document.body });
    await flushPromises();

    expect(window.document.activeElement).not.toBe(component.element);

    isEnabled.value = true;
    await flushPromises();

    expect(window.document.activeElement).toBe(component.element);
  });

  test("leaves a reader who is typing elsewhere alone", async () => {
    expect.hasAssertions();

    const typing = window.document.body.appendChild(window.document.createElement("textarea"));
    typing.focus();
    const component = mount(createInputComponent(ref(true)), { attachTo: window.document.body });
    await flushPromises();

    expect(window.document.activeElement).toBe(typing);
    expect(window.document.activeElement).not.toBe(component.element);
  });

  test("takes focus from a control that takes no text", async () => {
    expect.hasAssertions();

    const button = window.document.body.appendChild(window.document.createElement("button"));
    button.focus();
    const component = mount(createInputComponent(ref(true)), { attachTo: window.document.body });
    await flushPromises();

    expect(window.document.activeElement).toBe(component.element);
  });

  test("does not ask again once it has had its chance", async () => {
    expect.hasAssertions();

    const isEnabled = ref(true);
    const component = mount(createInputComponent(isEnabled), { attachTo: window.document.body });
    await flushPromises();
    const other = window.document.body.appendChild(window.document.createElement("input"));
    other.focus();
    isEnabled.value = false;
    await flushPromises();
    isEnabled.value = true;
    await flushPromises();

    expect(window.document.activeElement).toBe(other);
    expect(window.document.activeElement).not.toBe(component.element);
  });
});
