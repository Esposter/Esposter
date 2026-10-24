import type { VNode } from "vue";

import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { renderEmailCanvasVNodes } from "@/services/pageBuilder/email/renderEmailCanvasVNodes";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test } from "vitest";

const TWO_COLUMN_SOURCE = `<mjml><mj-body><mj-section><mj-column><mj-text>Hello</mj-text></mj-column><mj-column><mj-text>World</mj-text></mj-column></mj-section></mj-body></mjml>`;

const parseEmail = (source: string) => {
  const result = parseMjmlDocument(source, emailRegistry, emailBodyChildrenSchema, noteRichText, MAX_EMAIL_NODES);
  if (!result.success) throw new Error("the test email should parse");

  return result.data;
};
const childrenOf = (vnode: VNode) => vnode.children as VNode[];
const styleOf = (vnode: VNode) => vnode.props?.style as Record<string, string>;

describe("renderEmailCanvasVNodes", () => {
  test("columns stack below the mobile breakpoint", () => {
    expect.hasAssertions();

    const email = parseEmail(TWO_COLUMN_SOURCE);
    const [stacked] = renderEmailCanvasVNodes(emailKind, email, 375);
    const [side] = renderEmailCanvasVNodes(emailKind, email, 1024);
    if (!stacked || !side) throw new Error("the email should draw a section");

    expect(styleOf(stacked).flexDirection).toBe("column");
    expect(childrenOf(stacked).map((cell) => styleOf(cell).width)).toStrictEqual(["100%", "100%"]);
    expect(styleOf(side).flexDirection).toBe("row");
    expect(childrenOf(side).map((cell) => styleOf(cell).width)).toStrictEqual(["50%", "50%"]);
  });

  test("a new text shows the default font and padding", () => {
    expect.hasAssertions();

    const [section] = renderEmailCanvasVNodes(emailKind, parseEmail(TWO_COLUMN_SOURCE), 1024);
    if (!section) throw new Error("the email should draw a section");

    const [cell] = childrenOf(section);
    const [column] = cell ? childrenOf(cell) : [];
    const [text] = column ? childrenOf(column) : [];
    if (!text) throw new Error("the first column should draw its text");

    expect(styleOf(text).fontFamily).toBe("Ubuntu, Helvetica, Arial, sans-serif");
    expect(styleOf(text).padding).toBe("10px 25px");
  });
});
