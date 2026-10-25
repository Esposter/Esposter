import type { MjmlTextNode } from "mjml-blocks";

import { getEmailAttributeValue } from "#shared/services/pageBuilder/email/getEmailAttributeValue";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe(getEmailAttributeValue, () => {
  const TEST_TEXT_ID = crypto.randomUUID();
  const createText = (props: Partial<MjmlTextNode["props"]> = {}): MjmlTextNode => ({
    props: { content: { content: [], type: "doc" }, id: TEST_TEXT_ID, ...props },
    type: MjmlNodeType.Text,
  });

  test("an attribute the node sets wins over its default", () => {
    expect.hasAssertions();

    const text = createText({ padding: "4px" });

    expect(getEmailAttributeValue(text, "padding", undefined)).toBe("4px");
  });

  test("the root's mj-attributes for a tag win over its default and over mj-all", () => {
    expect.hasAssertions();

    const text = createText();
    const rootAttributes = { "mj-all": { padding: "0px" }, "mj-text": { padding: "8px" } };

    expect(getEmailAttributeValue(text, "padding", rootAttributes)).toBe("8px");
    expect(getEmailAttributeValue(text, "color", rootAttributes)).toBe("#000000");
  });

  test("the root's mj-all applies to a tag the root does not name", () => {
    expect.hasAssertions();

    const text = createText();

    expect(getEmailAttributeValue(text, "padding", { "mj-all": { padding: "0px" } })).toBe("0px");
  });
});
