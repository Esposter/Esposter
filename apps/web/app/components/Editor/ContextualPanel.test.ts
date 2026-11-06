// @vitest-environment happy-dom
import EditorContextualPanel from "@/components/Editor/ContextualPanel.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("editorContextualPanel", () => {
  test("Nothing selected shows the document settings", () => {
    expect.hasAssertions();

    const wrapper = mount(EditorContextualPanel, {
      props: { selectedCount: 0, title: " " },
      slots: { default: "<span></span>", documentSettings: "<p></p>" },
    });

    expect(wrapper.find("p").exists()).toBe(true);
    expect(wrapper.find("span").exists()).toBe(false);
  });

  test("A selection shows its own content, not the document settings", () => {
    expect.hasAssertions();

    const wrapper = mount(EditorContextualPanel, {
      props: { selectedCount: 1, title: " " },
      slots: { default: "<span></span>", documentSettings: "<p></p>" },
    });

    expect(wrapper.find("span").exists()).toBe(true);
    expect(wrapper.find("p").exists()).toBe(false);
  });

  test("An editor with no document settings shows no panel while nothing is selected", () => {
    expect.hasAssertions();

    const wrapper = mount(EditorContextualPanel, {
      props: { selectedCount: 0, title: " " },
      slots: { default: "<span></span>" },
    });

    expect(wrapper.find("aside").exists()).toBe(false);
  });

  test("The panel is a landmark named by its header", () => {
    expect.hasAssertions();

    const wrapper = mount(EditorContextualPanel, {
      props: { selectedCount: 1, title: " " },
      slots: { default: "<span></span>" },
    });

    expect(wrapper.get("aside").attributes("aria-label")).toBe(" ");
  });
});
