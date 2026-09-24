import type { AttributeNode, DirectiveNode, ElementNode, RootNode, TemplateChildNode } from "@vue/compiler-core";

import unoConfig from "@@/uno.config";
import vuetifyConfig from "@@/vuetify.config";
import { NodeTypes } from "@vue/compiler-core";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";
import { parse } from "vue/compiler-sfc";

const templatePaths = (await Array.fromAsync(glob("**/*.vue", { cwd: import.meta.dirname }))).map((templatePath) =>
  templatePath.replaceAll("\\", "/"),
);
const templates = await Promise.all(
  templatePaths.map(async (templatePath) => ({
    ast: parse(await readFile(join(import.meta.dirname, templatePath), "utf8")).descriptor.template?.ast,
    templatePath,
  })),
);
// Only a root, an element, a `v-for` and a `v-if` branch hold template children; a `v-if` holds branches
const walkElements = (node: RootNode | TemplateChildNode, visit: (element: ElementNode) => void): void => {
  if (node.type === NodeTypes.ELEMENT) visit(node);
  if (node.type === NodeTypes.IF) for (const branch of node.branches) walkElements(branch, visit);
  else if (
    node.type === NodeTypes.ROOT ||
    node.type === NodeTypes.ELEMENT ||
    node.type === NodeTypes.FOR ||
    node.type === NodeTypes.IF_BRANCH
  )
    for (const child of node.children) walkElements(child, visit);
};
const toPascalCase = (tag: string) =>
  tag.replaceAll(/(?:^|-)(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());
const toCamelCase = (name: string) =>
  name.replaceAll(/-(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());
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

    const uno = await createGenerator(unoConfig);
    const inertAttributes: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      const tokens = new Set<string>();
      walkElements(ast, ({ props, tag }) => {
        if (!/^[a-z][a-z0-9]*$/u.test(tag) || NON_NATIVE_ELEMENTS.has(tag)) return;
        for (const prop of props)
          if (prop.type === NodeTypes.ATTRIBUTE && !prop.value && !HTML_BOOLEAN_ATTRIBUTES.has(prop.name))
            tokens.add(prop.name);
      });
      for (const token of tokens) {
        const { matched } = await uno.generate(token, { preflights: false });
        if (!matched.has(token)) inertAttributes.push(`${templatePath}: ${token}`);
      }
    }

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

    const uno = await createGenerator(unoConfig);
    const emptyUtilities: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      const boundNames = new Set<string>();
      walkElements(ast, ({ props }) => {
        for (const prop of props) {
          const bind = getStaticBind(prop);
          if (bind && EMPTY_BRANCH_REGEX.test(bind.expression)) boundNames.add(bind.name);
        }
      });
      for (const boundName of boundNames) {
        const { matched } = await uno.generate(boundName, { preflights: false });
        if (matched.has(boundName)) emptyUtilities.push(`${templatePath}: :${boundName}`);
      }
    }

    expect(emptyUtilities).toStrictEqual([]);
  });

  // `unocss/blocklist` reports a refused spelling written as an attribute or a static class, and cannot see one
  // Inside a `:class` expression, where it is just a string. The generator refuses it there all the same, so a
  // Grid switched on a condition as `'grid-rows-1'` loses its rows with nothing reporting it. A variant is
  // Stripped first, because the blocklist is matched against the utility the variant wraps
  test("writes no refused spelling inside a bound class", async () => {
    expect.hasAssertions();

    const STRING_LITERAL_REGEX = /(?<quote>["'`])(?<content>.*?)\k<quote>/gu;
    const uno = await createGenerator(unoConfig);
    const refusedTokens: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      walkElements(ast, ({ props }) => {
        for (const prop of props) {
          const bind = getStaticBind(prop);
          if (bind?.name !== "class") continue;
          for (const { groups } of bind.expression.matchAll(STRING_LITERAL_REGEX))
            for (const token of groups?.content?.split(/\s+/u) ?? [])
              if (token && uno.isBlocked(token.split(":").at(-1) ?? ""))
                refusedTokens.push(`${templatePath}: ${token}`);
        }
      });
    }

    expect(refusedTokens).toStrictEqual([]);
  });

  // UnoCSS extracts a bare bracket attribute as a class token, so the rule it emits is a `.class` the element
  // Never carries; only the valued form `prop="[...]"` produces an attribute selector
  test("writes every arbitrary value in the valued form", () => {
    expect.hasAssertions();

    const bareBrackets: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      walkElements(ast, ({ props, tag }) => {
        for (const prop of props)
          if (prop.type === NodeTypes.ATTRIBUTE && !prop.value && prop.name.includes("["))
            bareBrackets.push(`${templatePath}: <${tag} ${prop.name}>`);
      });
    }

    expect(bareBrackets).toStrictEqual([]);
  });

  // The pair `text-hint` is defined as, written out — the shortcut exists so the pair is one token
  test("writes the text-hint pair as its shortcut", () => {
    expect.hasAssertions();

    const HINT_PAIR = ["op-medium-emphasis", "text-body-small"];
    const pairs: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      walkElements(ast, ({ props, tag }) => {
        const names = new Set(props.flatMap((prop) => (prop.type === NodeTypes.ATTRIBUTE ? [prop.name] : [])));
        if (HINT_PAIR.every((name) => names.has(name))) pairs.push(`${templatePath}: <${tag}>`);
      });
    }

    expect(pairs).toStrictEqual([]);
  });
});

// A bar that pushes its groups apart — a spacer between them, `justify-between` or `justify-end` — and also wraps puts its trailing
// Group alone at the end of a second line once the row runs short: one button at the start of the first line and one at
// The end of the next. A bar never wraps; its leading content yields and its actions collapse into an overflow menu on a
// Narrow screen (`responsive` skill)
const getAttributeNames = ({ props }: ElementNode) =>
  new Set(props.flatMap((prop) => (prop.type === NodeTypes.ATTRIBUTE ? [prop.name] : [])));
const checkIsSpacer = (node: TemplateChildNode) =>
  node.type === NodeTypes.ELEMENT &&
  node.tag === "div" &&
  node.children.length === 0 &&
  getAttributeNames(node).has("flex-1");

describe("bars", () => {
  test("wraps no bar that pushes its groups apart", () => {
    expect.hasAssertions();

    const wrappingBars: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      walkElements(ast, (element) => {
        const attributeNames = getAttributeNames(element);
        if (
          attributeNames.has("flex-wrap") &&
          (attributeNames.has("justify-between") ||
            attributeNames.has("justify-end") ||
            element.children.some((child) => checkIsSpacer(child)))
        )
          wrappingBars.push(`${templatePath}: <${element.tag}>`);
      });
    }

    expect(wrappingBars).toStrictEqual([]);
  });
});

// A button and a list row lay out their own content — the flex row, its gap and alignment, the block padding and the
// Control height are the `ui-button` and `ui-item` shortcuts' — so a call site restating one is a second copy that
// Drifts, and one written in the default layer silently beats the shortcut's (`ui-library` skill)
describe("library layout", () => {
  const BUTTON_TAGS = new Set(["UiButton", "UiButtonLink", "UiIconButton"]);
  const LAYOUT_ATTRIBUTE_REGEX = /^(?:inline-flex|flex|gap-\d+|items-center|justify-center|py-\d+|min-h-8)$/u;

  test("restates no layout a button or a row lays out itself", () => {
    expect.hasAssertions();

    const restatedLayouts: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      walkElements(ast, (element) => {
        const attributeNames = getAttributeNames(element);
        const isRow = attributeNames.has("ui-item");
        if (!isRow && !attributeNames.has("ui-button") && !BUTTON_TAGS.has(toPascalCase(element.tag))) return;
        for (const attributeName of attributeNames)
          if (LAYOUT_ATTRIBUTE_REGEX.test(attributeName) || (isRow && attributeName === "px-2"))
            restatedLayouts.push(`${templatePath}: <${element.tag} ${attributeName}>`);
      });
    }

    expect(restatedLayouts).toStrictEqual([]);
  });
});

// A Vuetify length given a bare number renders as px rather than the rem it was authored in; the `rem` string
// Is the form that keeps the unit ours (`styling` skill). Only a Vuetify component is asked — on an SVG
// Element or a third-party wrapper the unit is the library's
describe("vuetify lengths", () => {
  const LENGTH_PROPS = new Set(["height", "max-height", "max-width", "min-height", "min-width", "size", "width"]);
  const NUMBER_REGEX = /^\d*\.?\d+$/u;

  test("gives no Vuetify length a bare number", () => {
    expect.hasAssertions();

    const bareLengths: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      walkElements(ast, ({ props, tag }) => {
        if (!tag.startsWith("v-")) return;
        for (const prop of props)
          if (prop.type === NodeTypes.ATTRIBUTE) {
            if (LENGTH_PROPS.has(prop.name) && NUMBER_REGEX.test(prop.value?.content ?? ""))
              bareLengths.push(`${templatePath}: <${tag} ${prop.name}="${prop.value?.content}">`);
          } else {
            const bind = getStaticBind(prop);
            if (bind && LENGTH_PROPS.has(bind.name) && NUMBER_REGEX.test(bind.expression))
              bareLengths.push(`${templatePath}: <${tag} :${bind.name}>`);
          }
      });
    }

    expect(bareLengths).toStrictEqual([]);
  });
});

// A global default restated on one instance is a second copy of the value: the instance stops following the
// Default when it moves, and the reader cannot tell a deliberate override from a restatement. The defaults
// Object is the source, so a static attribute equal to it is the finding
describe("vuetify defaults", () => {
  const { defaults = {} } = vuetifyConfig;

  test("restates no global default on a component instance", () => {
    expect.hasAssertions();

    const restatements: string[] = [];
    for (const { ast, templatePath } of templates) {
      if (!ast) continue;
      walkElements(ast, ({ props, tag }) => {
        if (!tag.startsWith("v-")) return;
        const componentDefaults = defaults[toPascalCase(tag)];
        if (!componentDefaults) return;
        for (const prop of props)
          if (prop.type === NodeTypes.ATTRIBUTE) {
            const defaultValue = componentDefaults[toCamelCase(prop.name)];
            if (defaultValue === (prop.value?.content ?? true))
              restatements.push(`${templatePath}: <${tag} ${prop.name}>`);
          } else {
            const bind = getStaticBind(prop);
            if (!bind) continue;
            const defaultValue = componentDefaults[toCamelCase(bind.name)];
            if (defaultValue !== undefined && JSON.stringify(defaultValue) === bind.expression.replaceAll("'", '"'))
              restatements.push(`${templatePath}: <${tag} :${bind.name}>`);
          }
      });
    }

    expect(restatements).toStrictEqual([]);
  });
});

// Every authored length is `rem` (`styling` skill). What keeps `px` holds a dependency's own values: the vendored
// ApexCharts sample SVGs and Vuetify's SASS breakpoint API
describe("lengths", () => {
  const PX_REGEX = /[^a-z-]\d+px\b/u;
  const PX_EXCLUDED_PATH_REGEX = /^assets\/(?:dashboard\/demo\/icon\/|css\/settings\.scss$)/u;

  test("authors no px length", async () => {
    expect.hasAssertions();

    const stylePaths = (await Array.fromAsync(glob("**/*.{vue,scss}", { cwd: import.meta.dirname })))
      .map((stylePath) => stylePath.replaceAll("\\", "/"))
      .filter((stylePath) => !PX_EXCLUDED_PATH_REGEX.test(stylePath));
    const pxLines: string[] = [];
    for (const stylePath of stylePaths) {
      const lines = (await readFile(join(import.meta.dirname, stylePath), "utf8")).split("\n");
      for (const [index, line] of lines.entries())
        if (PX_REGEX.test(line) && !line.trimStart().startsWith("//")) pxLines.push(`${stylePath}:${index + 1}`);
    }

    expect(pxLines).toStrictEqual([]);
  });

  // A bare `--variable` inside a colour function in an arbitrary value: the token matches, the declaration is
  // Invalid, and the whole property is dropped with nothing to see (`styling`, `references/arbitrary-values.md`)
  test("wraps every custom property inside a colour function in var()", async () => {
    expect.hasAssertions();

    const BARE_VARIABLE_REGEX = /(?:rgb|rgba|hsl)\(--|color-mix\(in srgb, --/u;
    const stylePaths = (await Array.fromAsync(glob("**/*.{vue,scss}", { cwd: import.meta.dirname }))).map((stylePath) =>
      stylePath.replaceAll("\\", "/"),
    );
    const bareVariableLines: string[] = [];
    for (const stylePath of stylePaths) {
      const lines = (await readFile(join(import.meta.dirname, stylePath), "utf8")).split("\n");
      for (const [index, line] of lines.entries())
        if (BARE_VARIABLE_REGEX.test(line)) bareVariableLines.push(`${stylePath}:${index + 1}`);
    }

    expect(bareVariableLines).toStrictEqual([]);
  });
});

// The line of every app source a pattern matches, but for tests and the files that own what it finds
const getMatchingLines = async (pattern: RegExp, isOwner: (sourcePath: string) => boolean) => {
  const sourcePaths = (await Array.fromAsync(glob("**/*.{vue,scss,ts}", { cwd: import.meta.dirname })))
    .map((sourcePath) => sourcePath.replaceAll("\\", "/"))
    .filter((sourcePath) => !sourcePath.endsWith(".test.ts") && !isOwner(sourcePath));
  const matchingLines: string[] = [];
  for (const sourcePath of sourcePaths) {
    const lines = (await readFile(join(import.meta.dirname, sourcePath), "utf8")).split("\n");
    for (const [index, line] of lines.entries())
      if (pattern.test(line)) matchingLines.push(`${sourcePath}:${index + 1}`);
  }
  return matchingLines;
};

describe("design styles", () => {
  // The library draws what differs between styles, so only its folders, `NuxtTheme` (which puts the reader's style on
  // The root) and the document chrome in `globals.scss` name the style attribute, and only the icon map names the voxel
  // Style's icon set. Checked here rather than by oxlint, which reads neither a template's attributes nor a style block
  // @TODO: https://github.com/oxc-project/oxc/issues/15761
  const STYLE_OWNER_PATH_REGEX =
    /^(?:components\/Ui\/|composables\/ui\/|models\/ui\/|services\/ui\/|plugins\/ui\.ts$|components\/Nuxt\/Theme\.vue$|assets\/css\/globals\.scss$)/u;

  test("keys nothing on a design style outside the library", async () => {
    expect.hasAssertions();
    await expect(
      getMatchingLines(/data-ui-style/u, (sourcePath) => STYLE_OWNER_PATH_REGEX.test(sourcePath)),
    ).resolves.toStrictEqual([]);
  });

  // An edge or a line is drawing, so a feature draws one in the style's border width and never in steps: a shadow or a
  // Border written in steps, or a block of the edge or divider colour one step thick
  test("draws no edge in steps outside the library", async () => {
    expect.hasAssertions();
    await expect(
      getMatchingLines(
        /(?:shadow|border)[^;]*--ui-step|(?:shadow|b)="\[[^"]*--ui-step|bg-(?:border|divider)[^>]*\b[hw]-1\b|\b[hw]-1\b[^>]*bg-(?:border|divider)/u,
        (sourcePath) => STYLE_OWNER_PATH_REGEX.test(sourcePath),
      ),
    ).resolves.toStrictEqual([]);
  });

  test("names voxel's face and icon set only through the style tier", async () => {
    expect.hasAssertions();
    await expect(
      getMatchingLines(
        /i-pixelarticons:|VT323|--ui-font-pixel/u,
        (sourcePath) => sourcePath === "services/ui/UiIconMap.ts",
      ),
    ).resolves.toStrictEqual([]);
  });
});
