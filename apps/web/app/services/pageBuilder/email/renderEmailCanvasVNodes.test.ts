import type { VNode } from "vue";

import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { renderEmailCanvasVNodes } from "@/services/pageBuilder/email/renderEmailCanvasVNodes";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { takeOne } from "@esposter/shared";
import { MjmlNodeType, parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test } from "vitest";

const parseEmail = (source: string) => {
  const result = parseMjmlDocument(source, emailRegistry, emailBodyChildrenSchema, noteRichText, MAX_EMAIL_NODES);
  if (!result.success) throw new Error("the test email should parse");

  return result.data;
};
const childrenOf = (vnode: VNode) => vnode.children as VNode[];
const styleOf = (vnode: VNode) => vnode.props?.style as Record<string, string>;

describe("renderEmailCanvasVNodes", () => {
  const TWO_COLUMN_SOURCE = `<mjml><mj-body><mj-section><mj-column><mj-text>Hello</mj-text></mj-column><mj-column><mj-text>World</mj-text></mj-column></mj-section></mj-body></mjml>`;

  test("columns stack below the mobile breakpoint", () => {
    expect.hasAssertions();

    const email = parseEmail(TWO_COLUMN_SOURCE);
    const stacked = takeOne(renderEmailCanvasVNodes(emailKind, email, 375));
    const side = takeOne(renderEmailCanvasVNodes(emailKind, email, 1024));

    expect(styleOf(stacked).flexDirection).toBe("column");
    expect(childrenOf(stacked).map((cell) => styleOf(cell).width)).toStrictEqual(["100%", "100%"]);
    expect(styleOf(side).flexDirection).toBe("row");
    expect(childrenOf(side).map((cell) => styleOf(cell).width)).toStrictEqual(["50%", "50%"]);
  });

  test("a section's other children take the whole row and leave the columns their own widths", () => {
    expect.hasAssertions();

    const section = takeOne(
      renderEmailCanvasVNodes(
        emailKind,
        parseEmail(
          `<mjml><mj-body><mj-section><mj-raw><p>Raw</p></mj-raw><mj-column><mj-text>Left</mj-text></mj-column><mj-column><mj-text>Right</mj-text></mj-column></mj-section></mj-body></mjml>`,
        ),
        1024,
      ),
    );

    expect(childrenOf(section).map((cell) => styleOf(cell).width)).toStrictEqual(["100%", "50%", "50%"]);
  });

  test("a new text shows the default font and padding", () => {
    expect.hasAssertions();

    const section = takeOne(renderEmailCanvasVNodes(emailKind, parseEmail(TWO_COLUMN_SOURCE), 1024));
    const cell = takeOne(childrenOf(section));
    const column = takeOne(childrenOf(cell));
    const text = takeOne(childrenOf(column));

    expect(styleOf(text).fontFamily).toBe("Ubuntu, Helvetica, Arial, sans-serif");
    expect(styleOf(text).padding).toBe("10px 25px");
  });

  test("a labelled leaf draws the attributes its component takes", () => {
    expect.hasAssertions();

    const section = takeOne(
      renderEmailCanvasVNodes(
        emailKind,
        parseEmail(
          `<mjml><mj-body><mj-section><mj-column><mj-button href="#">Go</mj-button></mj-column></mj-section></mj-body></mjml>`,
        ),
        1024,
      ),
    );
    const column = takeOne(childrenOf(takeOne(childrenOf(section))));
    const button = takeOne(childrenOf(column));

    expect(styleOf(button)).toStrictEqual({
      backgroundColor: "#414141",
      borderRadius: "3px",
      color: "#ffffff",
      fontFamily: "Ubuntu, Helvetica, Arial, sans-serif",
      fontSize: "13px",
      fontWeight: "normal",
      height: undefined,
      lineHeight: "120%",
      padding: "10px 25px",
      textAlign: "center",
    });
    expect(button.children).toBe(MjmlNodeType.Button);
  });

  test("a divider is drawn as the rule its border attributes name", () => {
    expect.hasAssertions();

    const section = takeOne(
      renderEmailCanvasVNodes(
        emailKind,
        parseEmail(`<mjml><mj-body><mj-section><mj-column><mj-divider /></mj-column></mj-section></mj-body></mjml>`),
        1024,
      ),
    );
    const column = takeOne(childrenOf(takeOne(childrenOf(section))));
    const divider = takeOne(childrenOf(column));

    expect(styleOf(divider).borderTop).toBe("4px solid #000000");
  });
});
