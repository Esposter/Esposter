// @vitest-environment happy-dom
import EditorContextualPanel from "@/components/Editor/ContextualPanel.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("editorContextualPanel", () => {
  test("the panel draws its content under the header", () => {
    expect.hasAssertions();

    const wrapper = mount(EditorContextualPanel, { props: { title: " " }, slots: { default: "<span></span>" } });

    expect(wrapper.get("aside").find("span").exists()).toBe(true);
  });

  test("the panel is a landmark named by its header", () => {
    expect.hasAssertions();

    const wrapper = mount(EditorContextualPanel, { props: { title: " " }, slots: { default: "<span></span>" } });

    expect(wrapper.get("aside").attributes("aria-label")).toBe(" ");
  });
});
