import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

interface VueFile {
  path: string;
  text: string;
}

// The name a kebab-case attribute is bound to, its dashes cut and the next letter raised, as `vue/v-bind-style` reads
// It
const toBoundName = (name: string): string =>
  /[A-Z_]/u.test(name) ? name : name.replaceAll(/-(?<letter>\w)/gu, (_match, letter: string) => letter.toUpperCase());

const getLine = (text: string, index: number): number => text.slice(0, index).split("\n").length;

const toFile = (template: string): VueFile => ({ path: "a.vue", text: `<template>\n  ${template}\n</template>\n` });

// The template rules no tool runs for us yet, each read over the components' text in place of the rule, and each going
// With the upstream marker on its constants. The tree is read once for all of them
describe("templateTextRules", () => {
  // The top-level template, from its opening tag to its closing tag, each at the start of its line
  const TEMPLATE_REGEX = /^<template\b[^>]*>[\s\S]*?^<\/template>/mu;
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13534 — move the ban to vize's template list once its tree has
  // Modifiers
  const BARE_CLICK_STOP_MESSAGE =
    "Don't wall a control off with a bare `@click.stop`. The container that opens on a click asks `checkIsNestedInteraction(event)` first, and a region that is its own control without being a link, button or field carries `data-nested-interaction`. See openspec/specs/architecture/nested-interactions/design.md.";
  // A click directive with no value: `@click` or `v-on:click`, its modifiers, then a space, a `/` or a `>`, never a `=`
  const BARE_CLICK_REGEX = /(?<=\s)(?:@click|v-on:click)(?<modifiers>(?:\.[\w-]+)*)(?=\s|\/|>)(?!\s*=)/gu;
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13535 — drop the same-name check once vize's `vue/v-bind-style`
  // Takes sameNameShorthand
  const SAME_NAME_BIND_MESSAGE = 'Write a bind whose value is its own name as the shorthand: `:foo`, not `:foo="foo"`.';
  // A bind whose value is a bare identifier: `:` or `v-bind:`, the attribute's name, its modifiers, then the identifier
  const BIND_REGEX = /(?<=\s)(?::|v-bind:)(?<name>[A-Za-z][\w-]*)(?:\.[\w-]+)*="(?<value>[A-Za-z_$][\w$]*)"/gu;
  // @TODO: no upstream issue — ubugeeei-prod/vize: `vize fmt` pads the blocks but cannot replace oxfmt until it formats
  // In parallel and formats Markdown, YAML and CSS; drop the padding check once it does
  const UNPADDED_BLOCK_MESSAGE =
    "Put a blank line between a component's top-level blocks: this block opens straight after the previous one closes.";
  // A top-level closing tag on its own line, and the line after it starting with a tag: the lookahead leaves that tag
  // Out
  const UNPADDED_BLOCK_REGEX = /^<\/[\w-]+>\r?\n(?=<[\w-])/gmu;
  let trackedFiles: VueFile[] = [];

  // Every match of the regex inside the file's template that the check keeps, as `<path>:<line> → <match>: <message>`
  const getTemplateFindings = (
    files: VueFile[],
    regex: RegExp,
    checkIsFinding: (groups: Record<string, string | undefined>) => boolean,
    message: string,
  ): string[] =>
    files.flatMap(({ path, text }) => {
      const templateMatch = TEMPLATE_REGEX.exec(text);
      if (!templateMatch) return [];
      return [...templateMatch[0].matchAll(regex)]
        .filter(({ groups = {} }) => checkIsFinding(groups))
        .map((match) => `${path}:${getLine(text, templateMatch.index + match.index)} → ${match[0]}: ${message}`);
    });

  const getBareClickStops = (files: VueFile[]): string[] =>
    getTemplateFindings(
      files,
      BARE_CLICK_REGEX,
      ({ modifiers = "" }) => modifiers.split(".").includes("stop"),
      BARE_CLICK_STOP_MESSAGE,
    );

  const getSameNameBinds = (files: VueFile[]): string[] =>
    getTemplateFindings(
      files,
      BIND_REGEX,
      ({ name = "", value }) => toBoundName(name) === value,
      SAME_NAME_BIND_MESSAGE,
    );

  // Reported on the line the block opens on
  const getUnpaddedBlocks = (files: VueFile[]): string[] =>
    files.flatMap(({ path, text }) =>
      Array.from(
        text.matchAll(UNPADDED_BLOCK_REGEX),
        (match) => `${path}:${getLine(text, match.index + match[0].length)} → ${UNPADDED_BLOCK_MESSAGE}`,
      ),
    );

  beforeAll(() => {
    trackedFiles = readSweepFilePaths("*.vue").map((path) => ({
      path,
      text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"),
    }));
  }, TREE_READ_TIMEOUT_MS);

  test.each(["@click.stop", "@click.stop.prevent", "v-on:click.stop"])("flags the bare click stop %s", (directive) => {
    expect.hasAssertions();

    expect(getBareClickStops([toFile(`<button ${directive} />`)])).toStrictEqual([
      `a.vue:2 → ${directive}: ${BARE_CLICK_STOP_MESSAGE}`,
    ]);
  });

  test.each([
    '<button @click.stop="go()" />',
    '<button @click.stop ="go()" />',
    '<button @click="go()" />',
    "<button @keydown.stop />",
  ])("leaves the click %s alone", (template) => {
    expect.hasAssertions();

    expect(getBareClickStops([toFile(template)])).toStrictEqual([]);
  });

  test.each([':foo="foo"', ':foo-bar="fooBar"', 'v-bind:foo="foo"', ':foo.prop="foo"'])(
    "flags the same-name bind %s",
    (bind) => {
      expect.hasAssertions();

      expect(getSameNameBinds([toFile(`<div ${bind} />`)])).toStrictEqual([
        `a.vue:2 → ${bind}: ${SAME_NAME_BIND_MESSAGE}`,
      ]);
    },
  );

  test.each([':foo="foo.bar"', ':foo="bar"', ':foo-bar="foo-bar"', ":foo", 'foo="foo"'])(
    "leaves the attribute %s alone",
    (attribute) => {
      expect.hasAssertions();

      expect(getSameNameBinds([toFile(`<div ${attribute} />`)])).toStrictEqual([]);
    },
  );

  test.each([
    '<script setup lang="ts">\nconst a = 1;\n</script>\n<template>\n  <div />\n</template>\n',
    "<template>\n  <div />\n</template>\n<style scoped>\n</style>\n",
  ])("flags the unpadded blocks %j", (text) => {
    expect.hasAssertions();

    expect(getUnpaddedBlocks([{ path: "a.vue", text }])).toStrictEqual([`a.vue:4 → ${UNPADDED_BLOCK_MESSAGE}`]);
  });

  test.each([
    "</script>\n\n<template>\n",
    "<template>\n  <div>\n  </div>\n  </template>\n  <div />\n</template>\n",
    "</template>\nfreeform text\n",
  ])("leaves the blocks %j alone", (text) => {
    expect.hasAssertions();

    expect(getUnpaddedBlocks([{ path: "a.vue", text }])).toStrictEqual([]);
  });

  test("no tracked component breaks a template text rule", () => {
    expect.hasAssertions();

    expect([
      ...getBareClickStops(trackedFiles),
      ...getSameNameBinds(trackedFiles),
      ...getUnpaddedBlocks(trackedFiles),
    ]).toStrictEqual([]);
  });
});
