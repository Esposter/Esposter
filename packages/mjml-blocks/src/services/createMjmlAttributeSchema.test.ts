import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";
import { getResultAsync } from "@esposter/shared";
import mjml2html from "mjml";
import { describe, expect, test } from "vitest";

// Whether MJML's strict validation refuses a minimal source carrying the value on one real attribute of its tag
const checkIsRefusedByMjml = async (tag: string, attribute: string, value: string): Promise<boolean> => {
  const source = `<mjml><mj-body><mj-section><mj-column><${tag} ${attribute}="${value}"></${tag}></mj-column></mj-section></mj-body></mjml>`;
  const result = await getResultAsync(() => mjml2html(source, { validationLevel: "strict" }));
  return result.match(
    () => false,
    () => true,
  );
};

describe(createMjmlAttributeSchema, () => {
  test.each([
    { attribute: "fluid-on-mobile", grammar: "boolean", tag: "mj-image", value: "true" },
    { attribute: "fluid-on-mobile", grammar: "boolean", tag: "mj-image", value: "1" },
    { attribute: "color", grammar: "color", tag: "mj-text", value: "#abc" },
    { attribute: "color", grammar: "color", tag: "mj-text", value: "rgb(1,2,3)" },
    { attribute: "color", grammar: "color", tag: "mj-text", value: "red" },
    { attribute: "color", grammar: "color", tag: "mj-text", value: "not-a-color" },
    { attribute: "align", grammar: "enum(left,right,center,justify)", tag: "mj-text", value: "left" },
    { attribute: "align", grammar: "enum(left,right,center,justify)", tag: "mj-text", value: "middle" },
    { attribute: "cellpadding", grammar: "integer", tag: "mj-table", value: "5" },
    { attribute: "cellpadding", grammar: "integer", tag: "mj-table", value: "five" },
    { attribute: "title", grammar: "string", tag: "mj-button", value: "Go" },
    { attribute: "width", grammar: "unit(px)", tag: "mj-image", value: "100px" },
    { attribute: "width", grammar: "unit(px)", tag: "mj-image", value: "0" },
    { attribute: "width", grammar: "unit(px)", tag: "mj-image", value: "50%" },
    { attribute: "height", grammar: "unit(px,auto)", tag: "mj-image", value: "auto" },
    { attribute: "padding", grammar: "unit(px,%){1,4}", tag: "mj-button", value: "10px 25px" },
    { attribute: "padding", grammar: "unit(px,%){1,4}", tag: "mj-button", value: "1px 2px 3px 4px 5px" },
    { attribute: "line-height", grammar: "unit(px,%,)", tag: "mj-button", value: "120" },
    { attribute: "letter-spacing", grammar: "unitWithNegative(px,em)", tag: "mj-text", value: "-2px" },
  ])("$grammar on $tag $attribute agrees with MJML's strict validation for $value", async (sample) => {
    expect.hasAssertions();

    const schema = createMjmlAttributeSchema(parseMjmlAttributeType(sample.grammar), sample.attribute);
    expect(schema.safeParse(sample.value).success).toBe(
      !(await checkIsRefusedByMjml(sample.tag, sample.attribute, sample.value)),
    );
  });
  test.each([
    { attribute: "href", value: "javascript:alert(1)" },
    { attribute: "background-url", value: "data:text/html,x" },
    { attribute: "left-icon", value: "javascript:alert(1)" },
  ])("$attribute refuses the scheme of $value", ({ attribute, value }) => {
    expect.hasAssertions();

    expect(createMjmlAttributeSchema(parseMjmlAttributeType("string"), attribute).safeParse(value).success).toBe(false);
  });
  test("an address accepts an allowed scheme", () => {
    expect.hasAssertions();

    expect(
      createMjmlAttributeSchema(parseMjmlAttributeType("string"), "href").safeParse("https://example.com").success,
    ).toBe(true);
  });
});
