// @vitest-environment happy-dom
import MessageRightSideBarPane from "@/components/Message/RightSideBar/Pane.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageRightSideBarPane", () => {
  // Every pane draws the same title bar above the same body, so a pane's content is the body and nothing else
  test("A pane draws its header above a padded body that scrolls", () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, {
      props: { title: "title" },
      slots: { default: () => h("p", "a") },
    });
    const body = component.get("[ui-region-body]");

    expect(Array.from(component.element.children)).toStrictEqual([component.get("header").element, body.element]);
    expect(body.classes()).toStrictEqual(["p-3"]);
  });

  // A footer is the row a pane pins under its body, so the body scrolls above it and the footer never scrolls with it
  test("A pane's footer stays under the scrolling body", () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, {
      props: { title: "title" },
      slots: { default: () => h("p", "a"), footer: () => h("output", "footer") },
    });
    const body = component.get("[ui-region-body]");
    const footer = component.get("output").element.parentElement;

    expect(Array.from(component.element.children)).toStrictEqual([
      component.get("header").element,
      body.element,
      footer,
    ]);
    expect(body.element.contains(component.get("output").element)).toBe(false);
  });

  // A list that pads and scrolls itself is drawn in a bare body, so the pane adds no second padding around it
  test("A bare pane body keeps the scroll without the padding", () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, {
      props: { isBodyBare: true, title: "title" },
      slots: { default: () => h("ul", [h("li", "a")]) },
    });

    expect(component.get("[ui-region-body]").classes()).toStrictEqual([]);
  });

  test("Closing the pane's title bar emits close", async () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, { props: { title: "title" } });
    await component.get('[aria-label="Close title"]').trigger("click");

    expect(component.emitted("close")).toStrictEqual([[]]);
  });
});
