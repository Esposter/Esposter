// @vitest-environment happy-dom
import type { Block, Component, Trait } from "grapesjs";

import { formsPlugin } from "@/services/webpageEditor/plugins/formsPlugin";
import { takeOne } from "@esposter/shared";
import grapesJS, { usePlugin } from "grapesjs";
import { describe, expect, test } from "vitest";

const createEditor = (options: Parameters<typeof formsPlugin>[1] = {}) =>
  grapesJS.init({ headless: true, plugins: [usePlugin(formsPlugin, options)], storageManager: false });

describe(formsPlugin, () => {
  const FORM_TYPE = "form";
  const INPUT_TYPE = "input";
  const SELECT_OPTIONS_TRAIT = "select-options";
  const DEFAULT_BLOCK_IDS = ["form", "input", "textarea", "select", "button", "label", "checkbox", "radio"];

  test("registers the eight upstream blocks in the Forms category", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const blocks = editor.Blocks.getAll();

    expect(blocks.map((block: Block) => block.getId())).toStrictEqual(DEFAULT_BLOCK_IDS);
    expect(blocks.map((block: Block) => block.getCategoryLabel())).toStrictEqual(DEFAULT_BLOCK_IDS.map(() => "Forms"));
  });

  test("blocks: [] registers no blocks, the app's call", () => {
    expect.hasAssertions();

    const editor = createEditor({ blocks: [] });

    expect(editor.Blocks.getAll().map((block: Block) => block.getId())).toStrictEqual([]);
  });

  test("#12 a blocks list keeps only the listed blocks", () => {
    expect.hasAssertions();

    const editor = createEditor({ blocks: [INPUT_TYPE, "button"] });

    expect(editor.Blocks.getAll().map((block: Block) => block.getId())).toStrictEqual([INPUT_TYPE, "button"]);
  });

  test("category and block options reach every registered block", () => {
    expect.hasAssertions();

    const editor = createEditor({
      block: (blockId) => (blockId === INPUT_TYPE ? { label: "Text field" } : {}),
      blocks: [INPUT_TYPE, "label"],
      category: { id: "extra", label: "Extra" },
    });

    expect(editor.Blocks.get(INPUT_TYPE)?.get("label")).toBe("Text field");
    expect(editor.Blocks.getAll().map((block: Block) => block.getCategoryLabel())).toStrictEqual(["Extra", "Extra"]);
  });

  test("#4 a form with no method attribute shows GET in its method trait", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const form = takeOne([editor.Components.addComponent({ type: FORM_TYPE })].flat());

    expect(form.getTrait("method")?.getValue()).toBe("get");
  });

  test("#13 #47 parsed buttons, selects, checkboxes and radios keep their own component types", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const components = editor.Components.addComponent(
      '<button>Go</button><select name="s"></select><input type="checkbox"/><input type="radio"/><input/>',
    );

    expect([components].flat().map((component) => component.get("type"))).toStrictEqual([
      "button",
      "select",
      "checkbox",
      "radio",
      INPUT_TYPE,
    ]);
  });

  test("#27 #29 a select's default options read back in the options trait with their labels", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const select = takeOne([editor.Components.addComponent({ type: "select" })].flat());
    const optionsTrait = editor.TraitManager.getType(SELECT_OPTIONS_TRAIT);
    const optionsInput: unknown = Reflect.apply(optionsTrait.prototype.getInputEl, { target: select }, []);
    const optionsText = optionsInput instanceof HTMLTextAreaElement ? optionsInput.value : undefined;

    expect(optionsText).toBe("opt1::Option 1\nopt2::Option 2");
  });

  test("#27 options typed into the trait become option labels", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const select = takeOne([editor.Components.addComponent({ type: "select" })].flat());
    const optionsTrait = editor.TraitManager.getType(SELECT_OPTIONS_TRAIT);

    Reflect.apply(
      optionsTrait.prototype.onValueChange,
      { model: { get: () => "a::Apple::Red\nb" }, target: select },
      [],
    );

    expect(
      select
        .components()
        .map((option: Component) => [
          option.getAttributes().value,
          option.components().map((text: Component) => text.get("content")),
        ]),
    ).toStrictEqual([
      ["a", ["Apple::Red"]],
      ["b", ["b"]],
    ]);
  });

  test("#6 an input has an id trait, so a label's for can point at it", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const input = takeOne([editor.Components.addComponent({ type: INPUT_TYPE })].flat());

    expect(input.getTraits().map((trait: Trait) => trait.getName())).toStrictEqual([
      "id",
      "name",
      "placeholder",
      "type",
      "required",
    ]);
  });
});
