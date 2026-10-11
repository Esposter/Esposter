// @vitest-environment happy-dom
import grapesJS from "grapesjs";
import type { Component, Editor } from "grapesjs";
import { afterEach, describe, expect, test, vi } from "vitest";

import { customCodePlugin } from "@/services/webpageEditor/plugins/customCodePlugin";

const CUSTOM_CODE_ID = "custom-code";
const CODE_PROPERTY = "custom-code-plugin__code";
const DEFAULT_TEXT = "Insert here your custom code";
const PLACEHOLDER_TEXT = "can't be rendered on the canvas";
const SCRIPT_CODE = "<script>alert(1)</script><p>ok</p>";
const PLAIN_CODE = "<p>ok</p>";

const createEditor = () => grapesJS.init({ headless: true, plugins: [customCodePlugin], storageManager: false });

const addCustomCode = (editor: Editor) => editor.addComponents({ type: CUSTOM_CODE_ID })[0];

// The canvas mounts no view headless, so the view's own methods run on a stand-in carrying the same members
// The view classes are read from their registered type, whose view is typed any
const readViewPrototype = (editor: Editor, type: string) => {
  const definition = editor.Components.getType(type);
  const view = definition?.view;
  return view.prototype;
};

const mountStandInView = (editor: Editor, component: Component) => {
  const prototype = readViewPrototype(editor, CUSTOM_CODE_ID);
  return {
    el: document.createElement("div"),
    model: component,
    onComponentsChange: prototype.onComponentsChange,
    updatePlaceholder: prototype.updatePlaceholder,
  };
};

describe(customCodePlugin, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("registers the custom code block in the Extra category", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const block = editor.Blocks.get(CUSTOM_CODE_ID);

    expect(block?.getLabel()).toBe("Custom Code");
    expect(block?.getCategoryLabel()).toBe("Extra");
    expect(block?.get("content")).toStrictEqual({ type: CUSTOM_CODE_ID });
  });

  test("a new custom code opens with the default text", () => {
    expect.hasAssertions();

    const editor = createEditor();

    expect(addCustomCode(editor).toHTML()).toBe(`<div><span>${DEFAULT_TEXT}</span></div>`);
  });

  test("setting the code property replaces the markup with the code", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const component = addCustomCode(editor);
    component.set(CODE_PROPERTY, PLAIN_CODE);

    expect(component.toHTML()).toBe(`<div>${PLAIN_CODE}</div>`);
  });

  test("the toolbar gets the code button, which opens the modal", () => {
    expect.hasAssertions();

    const editor = createEditor();

    const toolbarButton = addCustomCode(editor)
      .get("toolbar")
      ?.find(({ id }) => id === CUSTOM_CODE_ID);

    expect(toolbarButton?.command).toBe("custom-code:open-modal");
  });

  test("a script in the code is never in the exported HTML", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const component = addCustomCode(editor);
    component.set(CODE_PROPERTY, SCRIPT_CODE);

    expect(component.toHTML()).not.toContain("<script");
  });

  test("#33 an empty code keeps the default text, so the block can still be opened to edit", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const component = addCustomCode(editor);
    component.set(CODE_PROPERTY, "");

    expect(component.toHTML()).toBe(`<div><span>${DEFAULT_TEXT}</span></div>`);
  });

  test("a code with a script shows the canvas placeholder and is not droppable", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const editor = createEditor();
    const component = addCustomCode(editor);
    component.set(CODE_PROPERTY, SCRIPT_CODE);
    const standInView = mountStandInView(editor, component);
    standInView.onComponentsChange();
    vi.runAllTimers();

    expect(component.get("droppable")).toBe(false);
    expect(standInView.el.textContent).toContain(PLACEHOLDER_TEXT);
  });

  test("no upstream issue: two custom codes each get their own pending placeholder update", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const editor = createEditor();
    const firstComponent = addCustomCode(editor);
    const secondComponent = addCustomCode(editor);
    firstComponent.set(CODE_PROPERTY, SCRIPT_CODE);
    secondComponent.set(CODE_PROPERTY, SCRIPT_CODE);
    const firstStandInView = mountStandInView(editor, firstComponent);
    const secondStandInView = mountStandInView(editor, secondComponent);
    firstStandInView.onComponentsChange();
    secondStandInView.onComponentsChange();
    vi.runAllTimers();

    expect(firstComponent.get("droppable")).toBe(false);
    expect(secondComponent.get("droppable")).toBe(false);
  });

  test("a script inside a custom code renders empty on the canvas", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const component = addCustomCode(editor);
    const scriptComponent = component.append({ tagName: "script", type: "script" })[0];
    const scriptElement = document.createElement("script");
    scriptElement.textContent = "alert(1)";
    const prototype = readViewPrototype(editor, "script");
    prototype.onRender.call({ el: scriptElement, model: scriptComponent });

    expect(scriptElement.innerHTML).toBe("");
  });
});
