import {
  EXCLUDED_MJML_TAGS,
  MJML_BODY_ATTRIBUTES,
  MJML_BODY_CHILDREN,
  MJML_BREAKPOINT_ATTRIBUTES,
  MJML_COMPONENT_SPECIFICATIONS,
} from "#src/services/constants";
import { TEST_RICH_TEXT } from "#src/services/constants.test";
import { createMjmlRegistry } from "#src/services/createMjmlRegistry";
import { createRequire } from "node:module";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

const CSS_CLASS = "css-class";
const MJ_CLASS = "mj-class";
// MJML's preset exports its components as classes, whose static fields hold each component's table
const PRESET_COMPONENT_SCHEMA = z.custom<object>((value) => typeof value === "function");
const PRESET_SCHEMA = z.object({
  components: z.array(PRESET_COMPONENT_SCHEMA),
  dependencies: z.record(z.string(), z.unknown()),
});
const readComponent = (component: object) => ({
  allowedAttributes: z.record(z.string(), z.string()).optional().parse(Reflect.get(component, "allowedAttributes")),
  componentName: z.string().parse(Reflect.get(component, "componentName")),
  defaultAttributes: z.record(z.string(), z.unknown()).parse(Reflect.get(component, "defaultAttributes")),
});

describe("components", () => {
  const preset = PRESET_SCHEMA.parse(createRequire(import.meta.url)("mjml-preset-core"));
  const components = preset.components.map(readComponent);
  const { dependencies } = preset;
  const SPECIFICATION_ROWS = MJML_COMPONENT_SPECIFICATIONS.map(
    (specification) => [specification.type, specification] as const,
  );

  test.each(SPECIFICATION_ROWS)(
    "%s takes the attributes MJML's component allows, less css-class and mj-class",
    (type, specification) => {
      expect.hasAssertions();

      const component = components.find((component) => component.componentName === type);
      assert.exists(component);
      expect(specification.allowedAttributes).toStrictEqual(
        Object.fromEntries(
          Object.entries(component.allowedAttributes ?? {}).filter(([name]) => name !== CSS_CLASS && name !== MJ_CLASS),
        ),
      );
    },
  );
  test.each(SPECIFICATION_ROWS)("%s has the default attributes MJML's component sets", (type, specification) => {
    expect.hasAssertions();

    const component = components.find((component) => component.componentName === type);
    assert.exists(component);
    expect(specification.defaultAttributes).toStrictEqual(
      Object.fromEntries(Object.entries(component.defaultAttributes).filter(([, value]) => typeof value === "string")),
    );
  });
  test.each(SPECIFICATION_ROWS)("%s has the children MJML's preset allows it", (type, specification) => {
    expect.hasAssertions();

    expect(specification.children).toStrictEqual(
      (z.array(z.string()).optional().parse(dependencies[type]) ?? []).filter(
        (tag) => !EXCLUDED_MJML_TAGS.includes(tag),
      ),
    );
  });
  test("the root's content is the children MJML's preset allows mj-body", () => {
    expect.hasAssertions();

    expect(MJML_BODY_CHILDREN).toStrictEqual(
      z
        .array(z.string())
        .parse(dependencies["mj-body"])
        .filter((tag) => !EXCLUDED_MJML_TAGS.includes(tag)),
    );
    expect(createMjmlRegistry({ leafTypes: [], richText: TEST_RICH_TEXT }).root.content).toStrictEqual(
      MJML_BODY_CHILDREN,
    );
  });
  test("the root's body and breakpoint take MJML's attributes", () => {
    expect.hasAssertions();

    const body = components.find((component) => component.componentName === "mj-body");
    const breakpoint = components.find((component) => component.componentName === "mj-breakpoint");
    expect(MJML_BODY_ATTRIBUTES).toStrictEqual(body?.allowedAttributes);
    expect(MJML_BREAKPOINT_ATTRIBUTES).toStrictEqual(breakpoint?.allowedAttributes);
  });
});
