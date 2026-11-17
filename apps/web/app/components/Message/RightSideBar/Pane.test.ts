// @vitest-environment happy-dom
import MessageRightSideBarPane from "#src/components/Message/RightSideBar/Pane.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageRightSideBarPane", () => {
  // Every pane draws the same title bar above the same body, so a pane's content is the body and nothing else
  test("a pane draws its header above a padded body that scrolls", () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, {
      props: { title: "title" },
      slots: { default: () => h("p", "a") },
    });
    const body = component.get("[ui-region-body]");

    expect([...component.element.children]).toStrictEqual([component.get("header").element, body.element]);
    expect(body.classes()).toStrictEqual(["p-3"]);
  });

  // A header is pinned under the title bar and a footer under the body, so neither scrolls with the body between them
  // It is what keeps a search field in view while its results scroll
  test("a pane's header and footer stay outside the scrolling body", () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, {
      props: { title: "title" },
      slots: { default: () => h("p", "a"), footer: () => h("output", "footer"), header: () => h("section", "a") },
    });
    const body = component.get("[ui-region-body]");
    const header = component.get("section").element.parentElement;
    const footer = component.get("output").element.parentElement;

    expect([...component.element.children]).toStrictEqual([
      component.get("header").element,
      header,
      body.element,
      footer,
    ]);
    expect(body.element.contains(component.get("section").element)).toBe(false);
    expect(body.element.contains(component.get("output").element)).toBe(false);
  });

  // A list that pads and scrolls itself is drawn in a bare body, so the pane adds no second padding around it
  test("a bare pane body keeps the scroll without the padding", () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, {
      props: { isBodyBare: true, title: "title" },
      slots: { default: () => h("ul", [h("li", "a")]) },
    });

    expect(component.get("[ui-region-body]").classes()).toStrictEqual([]);
  });

  test("closing the pane's title bar emits close", async () => {
    expect.hasAssertions();

    const component = mount(MessageRightSideBarPane, { props: { title: "title" } });
    await component.get('[aria-label="Close title"]').trigger("click");

    expect(component.emitted("close")).toStrictEqual([[]]);
  });
});
