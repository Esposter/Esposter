import type { ElementNode, RootNode, TemplateChildNode } from "@vue/compiler-core";

import unoConfig from "@@/uno.config";
import vuetifyConfig from "@@/vuetify.config";
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
const ELEMENT_NODE_TYPE = 1;
const ATTRIBUTE_NODE_TYPE = 6;
const DIRECTIVE_NODE_TYPE = 7;
const walkElements = (node: RootNode | TemplateChildNode, visit: (element: ElementNode) => void) => {
  if (node.type === ELEMENT_NODE_TYPE) visit(node);
  if ("children" in node) for (const child of node.children) walkElements(child, visit);
};
const toPascalCase = (tag: string) =>
  tag.replaceAll(/(?:^|-)(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());
const toCamelCase = (name: string) =>
  name.replaceAll(/-(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());

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
          if (prop.type === ATTRIBUTE_NODE_TYPE && !prop.value && !HTML_BOOLEAN_ATTRIBUTES.has(prop.name))
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
        for (const prop of props)
          if (
            prop.type === DIRECTIVE_NODE_TYPE &&
            prop.name === "bind" &&
            prop.arg?.type === 4 &&
            EMPTY_BRANCH_REGEX.test(prop.exp?.type === 4 ? prop.exp.content : "")
          )
            boundNames.add(prop.arg.content);
      });
      for (const boundName of boundNames) {
        const { matched } = await uno.generate(boundName, { preflights: false });
        if (matched.has(boundName)) emptyUtilities.push(`${templatePath}: :${boundName}`);
      }
    }

    expect(emptyUtilities).toStrictEqual([]);
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
          if (prop.type === ATTRIBUTE_NODE_TYPE && !prop.value && prop.name.includes("["))
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
        const names = new Set(props.flatMap((prop) => (prop.type === ATTRIBUTE_NODE_TYPE ? [prop.name] : [])));
        if (HINT_PAIR.every((name) => names.has(name))) pairs.push(`${templatePath}: <${tag}>`);
      });
    }

    expect(pairs).toStrictEqual([]);
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
          if (
            prop.type === ATTRIBUTE_NODE_TYPE &&
            LENGTH_PROPS.has(prop.name) &&
            NUMBER_REGEX.test(prop.value?.content ?? "")
          )
            bareLengths.push(`${templatePath}: <${tag} ${prop.name}="${prop.value?.content}">`);
          else if (
            prop.type === DIRECTIVE_NODE_TYPE &&
            prop.name === "bind" &&
            prop.arg?.type === 4 &&
            LENGTH_PROPS.has(prop.arg.content) &&
            NUMBER_REGEX.test(prop.exp?.type === 4 ? prop.exp.content : "")
          )
            bareLengths.push(`${templatePath}: <${tag} :${prop.arg.content}>`);
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
          if (prop.type === ATTRIBUTE_NODE_TYPE) {
            const defaultValue = componentDefaults[toCamelCase(prop.name)];
            if (defaultValue === (prop.value?.content ?? true))
              restatements.push(`${templatePath}: <${tag} ${prop.name}>`);
          } else if (
            prop.type === DIRECTIVE_NODE_TYPE &&
            prop.name === "bind" &&
            prop.arg?.type === 4 &&
            prop.exp?.type === 4
          ) {
            const defaultValue = componentDefaults[toCamelCase(prop.arg.content)];
            if (defaultValue !== undefined && JSON.stringify(defaultValue) === prop.exp.content.replaceAll("'", '"'))
              restatements.push(`${templatePath}: <${tag} :${prop.arg.content}>`);
          }
      });
    }

    expect(restatements).toStrictEqual([]);
  });
});

// Every authored length is `rem` (`styling` skill). The three files that keep `px` hold a dependency's own
// Values: the vendored ApexCharts sample SVGs, Vuetify's SASS breakpoint API and a vendored SVG's fills
describe("lengths", () => {
  const PX_REGEX = /[^a-z-]\d+px\b/u;
  const PX_EXCLUDED_PATH_REGEX =
    /^assets\/(?:dashboard\/demo\/icon\/|css\/settings\.scss$)|^components\/Visual\/FloatingAstronaut\.scss$/u;

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
