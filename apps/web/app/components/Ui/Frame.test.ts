// @vitest-environment happy-dom
import UiFrame from "@/components/Ui/Frame.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiFrame", () => {
  // The body is the one region the frame's column scrolls, so a body taller than the frame is held inside it while the
  // Title bar and the footer stay pinned around it. jsdom measures no layout, so the overflow itself is proven in a
  // Driven browser; this pins the order and the scroll owner it needs
  test("a long body scrolls under a pinned title bar and footer", () => {
    expect.hasAssertions();

    const component = mount(UiFrame, {
      props: { title: "title" },
      slots: { default: () => h("p", "a"), footer: () => h("button", { type: "button" }) },
    });
    const body = component.get("[ui-region-body]");
    const section = component.get("section").element;

    expect([...section.children]).toStrictEqual([
      component.get("header").element,
      body.element,
      component.get("footer").element,
    ]);
    expect(body.element.contains(component.get("p").element)).toBe(true);
  });

  // A frame with no title, actions or footer has nothing to pin, so it draws its body alone
  test("a frame with no title draws only the body", () => {
    expect.hasAssertions();

    const component = mount(UiFrame, { slots: { default: () => h("p", "a") } });

    expect(component.find("header").exists()).toBe(false);
    expect(component.find("footer").exists()).toBe(false);
    expect(component.find("[ui-region-body]").exists()).toBe(true);
  });

  test("a frame body is padded", () => {
    expect.hasAssertions();

    const component = mount(UiFrame, { props: { title: "title" }, slots: { default: () => h("p", "a") } });

    expect(component.get("[ui-region-body]").element.hasAttribute("p-3")).toBe(true);
  });
});
