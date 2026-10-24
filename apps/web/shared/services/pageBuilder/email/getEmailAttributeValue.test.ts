import type { MjmlTextNode } from "mjml-blocks";

import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

import { getEmailAttributeValue } from "./getEmailAttributeValue";

describe(getEmailAttributeValue, () => {
  const TEST_TEXT_ID = "00000000-0000-4000-8000-000000000001";
  const createText = (props: Partial<MjmlTextNode["props"]> = {}): MjmlTextNode => ({
    props: { content: { content: [], type: "doc" }, id: TEST_TEXT_ID, ...props },
    type: MjmlNodeType.Text,
  });

  test("A new text shows the default font and padding", () => {
    expect.hasAssertions();

    const text = createText();

    expect(getEmailAttributeValue(text, "font-family")).toBe("Ubuntu, Helvetica, Arial, sans-serif");
    expect(getEmailAttributeValue(text, "padding")).toBe("10px 25px");
  });

  test("an attribute the node sets wins over its default", () => {
    expect.hasAssertions();

    const text = createText({ padding: "4px" });

    expect(getEmailAttributeValue(text, "padding")).toBe("4px");
  });
});
