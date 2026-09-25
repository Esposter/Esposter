import type { AttributeNode, DirectiveNode, ElementNode, TemplateChildNode } from "@vue/compiler-core";

import { walkElements } from "@/walkElements.test";
import unoConfig from "@@/uno.config";
import { NodeTypes } from "@vue/compiler-core";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";
import { parse } from "vue/compiler-sfc";

// Every check below reads the same tree, so it is globbed and read once, each template is parsed once and walked
// Once into the elements every check iterates, and one generator answers every check that asks one. No check reads
// A source map, which the parse would otherwise build for every block (`templates.bench.md`)
const sourceFiles = await Promise.all(
  (await Array.fromAsync(glob("**/*.{vue,scss,ts}", { cwd: import.meta.dirname }))).map(async (sourcePath) => {
    const text = await readFile(join(import.meta.dirname, sourcePath), "utf8");
    return { lines: text.split("\n"), sourcePath: sourcePath.replaceAll("\\", "/"), text };
  }),
);
const templateElements: { element: ElementNode; templatePath: string }[] = [];
for (const { sourcePath, text } of sourceFiles) {
  if (!sourcePath.endsWith(".vue")) continue;
  const ast = parse(text, { sourceMap: false }).descriptor.template?.ast;
  if (ast)
    walkElements(ast, (element) => {
      templateElements.push({ element, templatePath: sourcePath });
    });
}
const uno = await createGenerator(unoConfig);
const getAttributeNames = ({ props }: ElementNode) =>
  new Set(props.flatMap((prop) => (prop.type === NodeTypes.ATTRIBUTE ? [prop.name] : [])));
const toPascalCase = (tag: string) =>
  tag.replaceAll(/(?:^|-)(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());
// A `v-bind` names a prop only where its argument is static: `:[name]` parses to the same expression node with
// `isStatic` false, whose content is the variable's name rather than the attribute the element ends up carrying,
// So reading it as a prop name reports a finding against whatever that variable happens to be called
const getStaticBind = (prop: AttributeNode | DirectiveNode) =>
  prop.type === NodeTypes.DIRECTIVE &&
  prop.name === "bind" &&
  prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
  prop.arg.isStatic
    ? { expression: prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION ? prop.exp.content : "", name: prop.arg.content }
    : undefined;
// The `path:line` of every line a check matches, over the sources another check keeps
const getMatchingLines = (checkIsMatch: (line: string) => boolean, checkIsKept: (sourcePath: string) => boolean) => {
  const matchingLines: string[] = [];
  for (const { lines, sourcePath } of sourceFiles) {
    if (!checkIsKept(sourcePath)) continue;
    for (const [index, line] of lines.entries())
      if (checkIsMatch(line)) matchingLines.push(`${sourcePath}:${index + 1}`);
  }
  return matchingLines;
};

// An attributify attribute that matches no rule is silent: nothing is generated, nothing warns, and the page
// Renders without the style it was meant to carry. The generator itself answers whether a token is a utility —
// The token has to be looked for in `matched` rather than counted there, because `uno.config.ts` safelists a
// Set of utilities the generator returns for every input. Only a native element is asked, because on a
// Component an attribute is as likely to be a prop as a utility, and only a valueless one, because a valued
// Attribute on a native element is HTML's own
describe("attributify", () => {
  // Built-in elements that are spelt like a native tag but resolve to a component, so an attribute on one is
  // That component's prop — vue's own, plus TresJS's `primitive`, whose `dispose` is a prop
  const NON_NATIVE_ELEMENTS = new Set([
    "component",
    "keep-alive",
    "primitive",
    "slot",
    "suspense",
    "teleport",
    "template",
    "transition",
  ]);
  // https://html.spec.whatwg.org/multipage/indices.html#attributes-3 — the boolean attributes, which are the one
  // Valueless form HTML itself defines; `hidden` is both and generates the same thing either way
  const HTML_BOOLEAN_ATTRIBUTES = new Set([
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "inert",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected",
  ]);

  // The two shapes that give an attribute the empty string: `cond ? '' : undefined` and its mirror
  const EMPTY_BRANCH_REGEX = /\?\s*(?:(?:''|"")\s*:\s*undefined|undefined\s*:\s*(?:''|""))\s*$/u;

  test("generates a rule for every valueless attribute on a native element", async () => {
    expect.hasAssertions();

    // Each token keyed by its finding, so a template reports a token once however often it writes it
    const tokenFindingMap = new Map<string, string>();
    for (const {
      element: { props, tag },
      templatePath,
    } of templateElements) {
      if (!/^[a-z][a-z0-9]*$/u.test(tag) || NON_NATIVE_ELEMENTS.has(tag)) continue;
      for (const prop of props)
        if (prop.type === NodeTypes.ATTRIBUTE && !prop.value && !HTML_BOOLEAN_ATTRIBUTES.has(prop.name))
          tokenFindingMap.set(`${templatePath}: ${prop.name}`, prop.name);
    }
    // One generate over every distinct token: each is matched on its own, so the set answers for all of them
    const { matched } = await uno.generate(new Set(tokenFindingMap.values()), { preflights: false });
    const inertAttributes = [...tokenFindingMap].flatMap(([finding, token]) => (matched.has(token) ? [] : [finding]));

    expect(inertAttributes).toStrictEqual([]);
  });

  // A utility switched on a condition through its own attribute emits nothing: an empty string is no value, so
  // The attribute lands on a rule only when some unrelated file happens to write that utility bare, and goes
  // Silent again the day that file changes. `:class="isLoading ? 'op-loading' : undefined"` emits the class and
  // Depends on nothing. The generator is again what tells a utility from a prop, and here a component is asked
  // Too: the test above reports a name it matches nothing for, which every component prop is, while this one
  // Reports only a name it does match, which a prop almost never is
  test("switches a utility through :class rather than an empty attribute value", async () => {
    expect.hasAssertions();

    const boundNameFindingMap = new Map<string, string>();
    for (const {
      element: { props },
      templatePath,
    } of templateElements)
      for (const prop of props) {
        const bind = getStaticBind(prop);
        if (bind && EMPTY_BRANCH_REGEX.test(bind.expression))
          boundNameFindingMap.set(`${templatePath}: :${bind.name}`, bind.name);
      }
    const { matched } = await uno.generate(new Set(boundNameFindingMap.values()), { preflights: false });
    const emptyUtilities = [...boundNameFindingMap].flatMap(([finding, boundName]) =>
      matched.has(boundName) ? [finding] : [],
    );

    expect(emptyUtilities).toStrictEqual([]);
  });

  // `unocss/blocklist` reports a refused spelling written as an attribute or a static class, and cannot see one
  // Inside a `:class` expression, where it is just a string. The generator refuses it there all the same, so a
  // Grid switched on a condition as `'grid-rows-1'` loses its rows with nothing reporting it. A variant is
  // Stripped first, because the blocklist is matched against the utility the variant wraps
  test("writes no refused spelling inside a bound class", () => {
    expect.hasAssertions();

    const STRING_LITERAL_REGEX = /(?<quote>["'`])(?<content>.*?)\k<quote>/gu;
    const refusedTokens: string[] = [];
    for (const {
      element: { props },
      templatePath,
    } of templateElements)
      for (const prop of props) {
        const bind = getStaticBind(prop);
        if (bind?.name !== "class") continue;
        for (const { groups } of bind.expression.matchAll(STRING_LITERAL_REGEX))
          for (const token of groups?.content?.split(/\s+/u) ?? [])
            if (token && uno.isBlocked(token.split(":").at(-1) ?? "")) refusedTokens.push(`${templatePath}: ${token}`);
      }

    expect(refusedTokens).toStrictEqual([]);
  });

  // UnoCSS extracts a bare bracket attribute as a class token, so the rule it emits is a `.class` the element
  // Never carries; only the valued form `prop="[...]"` produces an attribute selector
  test("writes every arbitrary value in the valued form", () => {
    expect.hasAssertions();

    const bareBrackets: string[] = [];
    for (const {
      element: { props, tag },
      templatePath,
    } of templateElements)
      for (const prop of props)
        if (prop.type === NodeTypes.ATTRIBUTE && !prop.value && prop.name.includes("["))
          bareBrackets.push(`${templatePath}: <${tag} ${prop.name}>`);

    expect(bareBrackets).toStrictEqual([]);
  });
});

// A bar that pushes its groups apart — a spacer between them, `justify-between` or `justify-end` — and also wraps puts its trailing
// Group alone at the end of a second line once the row runs short: one button at the start of the first line and one at
// The end of the next. A bar never wraps; its leading content yields and its actions collapse into an overflow menu on a
// Narrow screen (`responsive` skill)
const checkIsSpacer = (node: TemplateChildNode) =>
  node.type === NodeTypes.ELEMENT &&
  node.tag === "div" &&
  node.children.length === 0 &&
  getAttributeNames(node).has("flex-1");

describe("bars", () => {
  test("wraps no bar that pushes its groups apart", () => {
    expect.hasAssertions();

    const wrappingBars: string[] = [];
    for (const { element, templatePath } of templateElements) {
      const attributeNames = getAttributeNames(element);
      if (
        attributeNames.has("flex-wrap") &&
        (attributeNames.has("justify-between") ||
          attributeNames.has("justify-end") ||
          element.children.some((child) => checkIsSpacer(child)))
      )
        wrappingBars.push(`${templatePath}: <${element.tag}>`);
    }

    expect(wrappingBars).toStrictEqual([]);
  });
});

// A button and a list row lay out their own content — the flex row, its gap and alignment, the block padding and the
// Control height are the `ui-button`, `ui-item` and `ui-row` shortcuts' — so a call site restating one is a second copy that
// Drifts, and one written in the default layer silently beats the shortcut's (`ui-library` skill)
describe("library layout", () => {
  const BUTTON_TAGS = new Set(["UiButton", "UiButtonLink", "UiIconButton"]);
  const LAYOUT_ATTRIBUTE_REGEX = /^(?:inline-flex|flex|gap-\d+|items-center|justify-center|py-\d+|min-h-8)$/u;

  test("restates no layout a button or a row lays out itself", () => {
    expect.hasAssertions();

    const restatedLayouts: string[] = [];
    for (const { element, templatePath } of templateElements) {
      const attributeNames = getAttributeNames(element);
      const isRow = attributeNames.has("ui-item") || attributeNames.has("ui-row");
      if (!isRow && !attributeNames.has("ui-button") && !BUTTON_TAGS.has(toPascalCase(element.tag))) continue;
      for (const attributeName of attributeNames)
        if (LAYOUT_ATTRIBUTE_REGEX.test(attributeName) || (isRow && attributeName === "px-2"))
          restatedLayouts.push(`${templatePath}: <${element.tag} ${attributeName}>`);
    }

    expect(restatedLayouts).toStrictEqual([]);
  });
});

// Every authored length is `rem` (`styling` skill). What keeps `px` holds a dependency's own values: the vendored
// ApexCharts sample SVGs
describe("lengths", () => {
  const STYLE_PATH_REGEX = /\.(?:vue|scss)$/u;
  const PX_REGEX = /[^a-z-]\d+px\b/u;
  const PX_EXCLUDED_DIRECTORY = "assets/dashboard/demo/icon/";

  test("authors no px length", () => {
    expect.hasAssertions();

    expect(
      getMatchingLines(
        (line) => PX_REGEX.test(line) && !line.trimStart().startsWith("//"),
        (sourcePath) => STYLE_PATH_REGEX.test(sourcePath) && !sourcePath.startsWith(PX_EXCLUDED_DIRECTORY),
      ),
    ).toStrictEqual([]);
  });

  // A bare `--variable` inside a colour function in an arbitrary value: the token matches, the declaration is
  // Invalid, and the whole property is dropped with nothing to see (`styling`, `references/arbitrary-values.md`)
  test("wraps every custom property inside a colour function in var()", () => {
    expect.hasAssertions();

    const BARE_VARIABLE_REGEX = /(?:rgb|rgba|hsl)\(--|color-mix\(in srgb, --/u;

    expect(
      getMatchingLines(
        (line) => BARE_VARIABLE_REGEX.test(line),
        (sourcePath) => STYLE_PATH_REGEX.test(sourcePath),
      ),
    ).toStrictEqual([]);
  });
});

describe("design styles", () => {
  // The library draws what differs between styles, so only its folders, `NuxtTheme` (which puts the reader's style on
  // The root) and the document chrome in `globals.scss` name the style attribute, and only the icon map names the voxel
  // Style's icon set. Checked here rather than by oxlint, which reads neither a template's attributes nor a style block
  // @TODO: https://github.com/oxc-project/oxc/issues/15761
  const STYLE_OWNER_PATH_REGEX =
    /^(?:components\/Ui\/|composables\/ui\/|models\/ui\/|services\/ui\/|plugins\/ui\.ts$|components\/Nuxt\/Theme\.vue$|assets\/css\/globals\.scss$)/u;
  // Every app source but the tests, and the files that own what the check finds
  const checkIsKept = (sourcePath: string) =>
    !sourcePath.endsWith(".test.ts") && !STYLE_OWNER_PATH_REGEX.test(sourcePath);

  test("keys nothing on a design style outside the library", () => {
    expect.hasAssertions();
    expect(getMatchingLines((line) => /data-ui-style/u.test(line), checkIsKept)).toStrictEqual([]);
  });

  // An edge or a line is drawing, so a feature draws one in the style's border width and never in steps: a shadow or a
  // Border written in steps, or a block of the edge or divider colour one step thick
  test("draws no edge in steps outside the library", () => {
    expect.hasAssertions();

    const EDGE_IN_STEPS_REGEX =
      /(?:shadow|border)[^;]*--ui-step|(?:shadow|b)="\[[^"]*--ui-step|bg-(?:border|divider)[^>]*\b[hw]-1\b|\b[hw]-1\b[^>]*bg-(?:border|divider)/u;

    expect(getMatchingLines((line) => EDGE_IN_STEPS_REGEX.test(line), checkIsKept)).toStrictEqual([]);
  });

  test("names voxel's face and icon set only through the style tier", () => {
    expect.hasAssertions();
    expect(
      getMatchingLines(
        (line) => /i-pixelarticons:|VT323|--ui-font-pixel/u.test(line),
        (sourcePath) => !sourcePath.endsWith(".test.ts") && sourcePath !== "services/ui/UiIconMap.ts",
      ),
    ).toStrictEqual([]);
  });
});
