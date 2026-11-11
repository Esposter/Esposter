import type { ElementNode, RootNode, TemplateChildNode } from "@vue/compiler-core";

import { walkElements } from "@/walkElements.test";
import { NodeTypes } from "@vue/compiler-core";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { parse } from "vue/compiler-sfc";

// The slot a template fills, `default` for `#default` and undefined for anything that is not a slot's template
const getFilledSlot = (element: ElementNode) => {
  if (element.tag !== "template") return undefined;
  for (const prop of element.props) {
    if (prop.type === NodeTypes.ATTRIBUTE && prop.name === "slot") return prop.value?.content ?? "default";
    if (prop.type === NodeTypes.DIRECTIVE && prop.name === "slot")
      return prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION ? prop.arg.content : "default";
  }
  return undefined;
};

// The utilities an element names: its attribute names, a static class's tokens and the string literals of a bound
// Class, each with its variant stripped, since a variant only says when a utility applies
const getUtilities = ({ props }: ElementNode) =>
  props
    .flatMap((prop) => {
      if (prop.type === NodeTypes.ATTRIBUTE)
        return prop.name === "class" ? (prop.value?.content.split(/\s+/u) ?? []) : [prop.name];
      if (
        prop.type !== NodeTypes.DIRECTIVE ||
        prop.name !== "bind" ||
        prop.arg?.type !== NodeTypes.SIMPLE_EXPRESSION ||
        !prop.arg.isStatic
      )
        return [];
      if (prop.arg.content !== "class") return [prop.arg.content];
      const expression = prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION ? prop.exp.content : "";
      return [...expression.matchAll(/(?<quote>["'`])(?<content>.*?)\k<quote>/gu)].flatMap(
        ({ groups }) => groups?.content?.split(/\s+/u) ?? [],
      );
    })
    .map((utility) => utility.slice(utility.lastIndexOf(":") + 1));

describe("dialog regions", () => {
  // Matched with the case and the dashes dropped, so a tag spelt either way counts
  const DIALOG_TAGS = new Set([
    "styleddialog",
    "stylededitformdialog",
    "styledformdialog",
    "uiconfirmdialog",
    "uidialog",
  ]);
  // A scroll or a viewport height is the body's own region, so it counts anywhere in the body
  const SCROLL_OR_VIEWPORT_REGEX = /^(?:of|overflow)(?:-y)?-(?:auto|scroll)$|^(?:max-)?h-\[[^\]]*dvh\]$/u;
  // Padding and a minimum height count only on the body's root, since a row inside a list may pad itself
  const ROOT_PADDING_OR_MIN_HEIGHT_REGEX = /^(?:p-[34]$|min-h-)/u;
  // The shapes a call site may keep, each named by the file and the element or utility that draws it, with the one
  // Line of why the design keeps it
  const CONTENT_SCROLLERS = new Map<string, string>([
    [
      "components/Message/Model/Message/ReactionsDialog/Index.vue: <div of-y-auto>",
      "The reacted-by list is one pane of a tall two-pane body, which scrolls inside the frame while the rail stays in view",
    ],
  ]);

  // The elements a dialog draws as its body: its children less the templates that fill a named slot, unwrapping a
  // Template that fills `#default` or nothing to what it holds. `v-if` and `v-for` stay props of the element they sit on
  const getBodyRoots = (nodes: TemplateChildNode[]): ElementNode[] =>
    nodes.flatMap((node) => {
      if (node.type !== NodeTypes.ELEMENT) return [];
      if (node.tag !== "template") return [node];
      const filledSlot = getFilledSlot(node);
      return filledSlot === undefined || filledSlot === "default" ? getBodyRoots(node.children) : [];
    });
  // The regions a dialog's default slot draws itself, each as the file and the element or utility that draws it
  const getDrawnRegions = (ast: RootNode | undefined, sourcePath: string) => {
    const drawnRegions = new Set<string>();
    if (ast)
      walkElements(ast, (dialog) => {
        if (!DIALOG_TAGS.has(dialog.tag.replaceAll("-", "").toLowerCase())) return;
        for (const root of getBodyRoots(dialog.children))
          walkElements(root, (element) => {
            if (element.tag === "footer" || element.tag === "fieldset")
              drawnRegions.add(`${sourcePath}: <${element.tag}>`);
            for (const utility of getUtilities(element))
              if (
                SCROLL_OR_VIEWPORT_REGEX.test(utility) ||
                (element === root && ROOT_PADDING_OR_MIN_HEIGHT_REGEX.test(utility))
              )
                drawnRegions.add(`${sourcePath}: <${element.tag} ${utility}>`);
          });
      });
    return [...drawnRegions];
  };

  const getFixtureRegions = (defaultSlot: string) =>
    getDrawnRegions(
      parse(`<template><UiDialog title="title">${defaultSlot}</UiDialog></template>`, { sourceMap: false }).descriptor
        .template?.ast,
      "fixture.vue",
    );

  test("a call site that draws its own footer fails the scan", () => {
    expect.hasAssertions();

    expect(getFixtureRegions(`<div flex flex-col gap-3><footer flex gap-2>Save</footer></div>`)).toStrictEqual([
      "fixture.vue: <footer>",
    ]);
  });

  test.each([
    ["a fieldset", `<fieldset flex flex-col><legend>Group</legend></fieldset>`, "fixture.vue: <fieldset>"],
    ["its own scroll", `<div flex flex-col of-y-auto gap-3>Rows</div>`, "fixture.vue: <div of-y-auto>"],
    ["a viewport height", `<div flex flex-col h-[80dvh] gap-3>Rows</div>`, "fixture.vue: <div h-[80dvh]>"],
    ["a minimum height on the root", `<div flex flex-col min-h-0 gap-3>Rows</div>`, "fixture.vue: <div min-h-0>"],
    ["padding on the root", `<div flex flex-col p-3 gap-3>Rows</div>`, "fixture.vue: <div p-3>"],
  ])("a call site that draws %s in its default slot fails the scan", (_shape, defaultSlot, finding) => {
    expect.hasAssertions();

    expect(getFixtureRegions(defaultSlot)).toStrictEqual([finding]);
  });

  test("a call site that supplies only content, and its footer in the footer slot, passes the scan", () => {
    expect.hasAssertions();

    expect(
      getFixtureRegions(
        `<div flex flex-col gap-3><UiTextField label="Label" /></div><template #footer><UiButton>Save</UiButton></template>`,
      ),
    ).toStrictEqual([]);
  });

  test("no call site draws its own region in its default slot", async () => {
    expect.hasAssertions();

    const appDirectory = join(import.meta.dirname, "..", "..");
    const drawnRegions = await Promise.all(
      (await Array.fromAsync(glob("**/*.vue", { cwd: appDirectory }))).map(async (sourcePath) => {
        const text = await readFile(join(appDirectory, sourcePath), "utf8");
        const ast = parse(text, { sourceMap: false }).descriptor.template?.ast;
        return getDrawnRegions(ast, sourcePath.replaceAll("\\", "/"));
      }),
    );

    expect(drawnRegions.flat().filter((drawnRegion) => !CONTENT_SCROLLERS.has(drawnRegion))).toStrictEqual([]);
  });
});
