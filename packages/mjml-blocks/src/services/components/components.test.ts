import {
  EXCLUDED_MJML_TAGS,
  MJML_BODY_ATTRIBUTES,
  MJML_BODY_CHILDREN,
  MJML_BREAKPOINT_ATTRIBUTES,
} from "#src/services/constants";
import { TEST_CHILDREN, TEST_REGISTRY, TEST_RICH_TEXT } from "#src/services/constants.test";
import { createMjmlRegistry } from "#src/services/createMjmlRegistry";
import { parse } from "node-html-parser";
import { createRequire } from "node:module";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

// MJML writes some defaults as entities, which the read back decodes, so each default is compared as the character it names
const decodeDefault = (value: string): string =>
  parse(`<i value="${value}"></i>`).querySelector("i")?.getAttribute("value") ?? value;

const readComponent = (component: object) => ({
  allowedAttributes: z.record(z.string(), z.string()).optional().parse(Reflect.get(component, "allowedAttributes")),
  componentName: z.string().parse(Reflect.get(component, "componentName")),
  defaultAttributes: z.record(z.string(), z.unknown()).parse(Reflect.get(component, "defaultAttributes")),
});

describe("components", () => {
  const CSS_CLASS = "css-class";
  const MJ_CLASS = "mj-class";
  // MJML's preset exports its components as classes, whose static fields hold each component's table
  const PRESET_COMPONENT_SCHEMA = z.custom<object>((value) => typeof value === "function");
  const PRESET_SCHEMA = z.object({
    components: z.array(PRESET_COMPONENT_SCHEMA),
    dependencies: z.record(z.string(), z.unknown()),
  });

  const preset = PRESET_SCHEMA.parse(createRequire(import.meta.url)("mjml-preset-core"));
  const components = preset.components.map((component) => readComponent(component));
  const { dependencies } = preset;
  const DEFINITION_ROWS = TEST_REGISTRY.types.map((definition) => [definition.type, definition] as const);

  test.each(DEFINITION_ROWS)(
    "%s takes the attributes MJML's component allows, less css-class and mj-class",
    (type, definition) => {
      expect.hasAssertions();

      const component = components.find((candidate) => candidate.componentName === type);
      assert.exists(component);
      expect(definition.allowedAttributes).toStrictEqual(
        Object.fromEntries(
          Object.entries(component.allowedAttributes ?? {}).filter(([name]) => name !== CSS_CLASS && name !== MJ_CLASS),
        ),
      );
    },
  );

  test.each(DEFINITION_ROWS)("%s has the default attributes MJML's component sets", (type, definition) => {
    expect.hasAssertions();

    const component = components.find((candidate) => candidate.componentName === type);
    assert.exists(component);
    expect(definition.defaultAttributes).toStrictEqual(
      Object.fromEntries(
        Object.entries(component.defaultAttributes).flatMap(([name, value]) =>
          typeof value === "string" ? [[name, decodeDefault(value)] satisfies [string, string]] : [],
        ),
      ),
    );
  });

  test.each(DEFINITION_ROWS)("%s has the children MJML's preset allows it", (type, definition) => {
    expect.hasAssertions();

    const children = (z.array(z.string()).optional().parse(dependencies[type]) ?? []).filter(
      (tag) => !EXCLUDED_MJML_TAGS.includes(tag),
    );
    expect(definition.slots).toStrictEqual(children.length > 0 ? { children } : {});
  });

  test("the root's content is the children MJML's preset allows mj-body", () => {
    expect.hasAssertions();

    expect(MJML_BODY_CHILDREN).toStrictEqual(
      z
        .array(z.string())
        .parse(dependencies["mj-body"])
        .filter((tag) => !EXCLUDED_MJML_TAGS.includes(tag)),
    );
    expect(
      createMjmlRegistry({ children: TEST_CHILDREN, leafTypes: [], richText: TEST_RICH_TEXT }).root.content,
    ).toStrictEqual(MJML_BODY_CHILDREN);
  });

  test("the root's body and breakpoint take MJML's attributes", () => {
    expect.hasAssertions();

    const body = components.find((component) => component.componentName === "mj-body");
    const breakpoint = components.find((component) => component.componentName === "mj-breakpoint");
    expect(MJML_BODY_ATTRIBUTES).toStrictEqual(body?.allowedAttributes);
    expect(MJML_BREAKPOINT_ATTRIBUTES).toStrictEqual(breakpoint?.allowedAttributes);
  });
});
