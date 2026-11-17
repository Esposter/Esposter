import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type {
  MjmlButtonNode,
  MjmlColumnNode,
  MjmlNavbarLinkNode,
  MjmlNavbarNode,
  MjmlRichText,
  MjmlSectionNode,
  MjmlTextNode,
} from "mjml-blocks";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import {
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_THIRD_ID,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import {
  TEST_DARK_VALUE,
  TEST_GREY_VALUE,
  TEST_LIGHT_VALUE,
  TEST_VALUE_COLOR_MAP,
} from "#shared/services/pageBuilder/critique/constants.test";
import { critiqueEmail } from "#shared/services/pageBuilder/email/critique/critiqueEmail";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

type ColumnChild = MjmlColumnNode["props"]["children"][number];

type EmailDocumentInput = Parameters<typeof critiqueEmail>[0];

const createText = (id: string, color?: string): MjmlTextNode => ({
  props: { content: { content: [{ text: TEST_LABEL, type: "text" }], type: "doc" }, id, ...(color && { color }) },
  type: MjmlNodeType.Text,
});
// A text block whose rich text holds the given headings, in the order they are written
const createHeadingText = (id: string, headings: MjmlRichText[]): MjmlTextNode => ({
  props: { content: { content: headings, type: "doc" }, id },
  type: MjmlNodeType.Text,
});
const createHeading = (level: number, text: string): MjmlRichText => ({
  attrs: { level },
  content: text ? [{ text, type: "text" }] : [],
  type: "heading",
});
const createColumn = (children: ColumnChild[], backgroundColor?: string): MjmlColumnNode => ({
  props: { children, id: TEST_OTHER_ID, ...(backgroundColor && { "background-color": backgroundColor }) },
  type: MjmlNodeType.Column,
});
const createSection = (children: ColumnChild[]): MjmlSectionNode => ({
  props: { children: [createColumn(children)], id: TEST_THIRD_ID },
  type: MjmlNodeType.Section,
});
const createDocument = (content: MjmlSectionNode[]): EmailDocumentInput => ({ content, root: { props: {} } });

describe(critiqueEmail, () => {
  const TEST_UNREADABLE_VALUE = "not-a-colour";
  const TEST_EXACT_RATIO_VALUE = "exact-ratio";
  const TEST_BLACK_VALUE = "black";
  // The grey whose relative luminance is 0.175, so its ratio with black is exactly 4.5 to 1
  const TEST_EXACT_RATIO_COLOR = [0.4553306431077955, 0.4553306431077955, 0.4553306431077955] as const;
  const TEST_HEADING_LEVEL_ONE = 1;
  const TEST_HEADING_LEVEL_TWO = 2;
  const TEST_HEADING_LEVEL_THREE = 3;

  const readColor = (value: string) => {
    if (value === TEST_EXACT_RATIO_VALUE) return TEST_EXACT_RATIO_COLOR;
    if (value === TEST_BLACK_VALUE) return [0, 0, 0] as const;
    return TEST_VALUE_COLOR_MAP.get(value);
  };

  test("a button with no address is reported", () => {
    expect.hasAssertions();

    const button: MjmlButtonNode = { props: { content: TEST_LABEL, id: TEST_ID }, type: MjmlNodeType.Button };

    expect(critiqueEmail(createDocument([createSection([button])]), { readColor })).toStrictEqual<CritiqueFinding[]>([
      { kind: CritiqueFindingKind.LinkWithoutAddress, nodeId: TEST_ID },
    ]);
  });

  test("a navbar link with no text is reported", () => {
    expect.hasAssertions();

    const navbarLink: MjmlNavbarLinkNode = {
      props: { content: "", href: TEST_URL, id: TEST_ID },
      type: MjmlNodeType.NavbarLink,
    };
    const navbar: MjmlNavbarNode = { props: { children: [navbarLink], id: TEST_OTHER_ID }, type: MjmlNodeType.Navbar };

    expect(critiqueEmail(createDocument([createSection([navbar])]), { readColor })).toStrictEqual<CritiqueFinding[]>([
      { kind: CritiqueFindingKind.LinkWithoutText, nodeId: TEST_ID },
    ]);
  });

  test("a button with an address and a label is not reported", () => {
    expect.hasAssertions();

    const button: MjmlButtonNode = {
      props: { content: TEST_LABEL, href: TEST_URL, id: TEST_ID },
      type: MjmlNodeType.Button,
    };

    expect(critiqueEmail(createDocument([createSection([button])]), { readColor })).toStrictEqual([]);
  });

  test("a heading two levels below the one before it is reported", () => {
    expect.hasAssertions();

    const document = createDocument([
      createSection([createHeadingText(TEST_ID, [createHeading(TEST_HEADING_LEVEL_ONE, TEST_LABEL)])]),
      createSection([createHeadingText(TEST_OTHER_ID, [createHeading(TEST_HEADING_LEVEL_THREE, TEST_LABEL)])]),
    ]);

    expect(critiqueEmail(document, { readColor })).toStrictEqual<CritiqueFinding[]>([
      { kind: CritiqueFindingKind.SkippedHeading, nodeId: TEST_OTHER_ID },
    ]);
  });

  test("a heading one level below the one before it is not reported", () => {
    expect.hasAssertions();

    const document = createDocument([
      createSection([createHeadingText(TEST_ID, [createHeading(TEST_HEADING_LEVEL_ONE, TEST_LABEL)])]),
      createSection([createHeadingText(TEST_OTHER_ID, [createHeading(TEST_HEADING_LEVEL_TWO, TEST_LABEL)])]),
    ]);

    expect(critiqueEmail(document, { readColor })).toStrictEqual([]);
  });

  test("an empty heading is reported", () => {
    expect.hasAssertions();

    const document = createDocument([
      createSection([createHeadingText(TEST_ID, [createHeading(TEST_HEADING_LEVEL_ONE, "")])]),
    ]);

    expect(critiqueEmail(document, { readColor })).toStrictEqual<CritiqueFinding[]>([
      { kind: CritiqueFindingKind.EmptyHeading, nodeId: TEST_ID },
    ]);
  });

  test("low-contrast text is reported with its node", () => {
    expect.hasAssertions();

    const document = createDocument([createSection([createText(TEST_ID, TEST_GREY_VALUE)])]);

    expect(critiqueEmail(document, { readColor })).toStrictEqual<CritiqueFinding[]>([
      { contrastRatio: 1.6059285649, kind: CritiqueFindingKind.LowContrast, nodeId: TEST_ID },
    ]);
  });

  test("text at exactly 4.5 to 1 is not reported", () => {
    expect.hasAssertions();

    const document = createDocument([
      {
        props: {
          children: [createColumn([createText(TEST_ID, TEST_EXACT_RATIO_VALUE)], TEST_BLACK_VALUE)],
          id: TEST_THIRD_ID,
        },
        type: MjmlNodeType.Section,
      },
    ]);

    expect(critiqueEmail(document, { readColor })).toStrictEqual([]);
  });

  test("text is checked against its column background", () => {
    expect.hasAssertions();

    const document = createDocument([
      {
        props: {
          children: [createColumn([createText(TEST_ID, TEST_LIGHT_VALUE)], TEST_DARK_VALUE)],
          id: TEST_THIRD_ID,
        },
        type: MjmlNodeType.Section,
      },
    ]);

    expect(critiqueEmail(document, { readColor })).toStrictEqual([]);
  });

  test("a colour the editor cannot read is reported unchecked", () => {
    expect.hasAssertions();

    const document = createDocument([createSection([createText(TEST_ID, TEST_UNREADABLE_VALUE)])]);

    expect(critiqueEmail(document, { readColor })).toStrictEqual<CritiqueFinding[]>([
      { kind: CritiqueFindingKind.UncheckedContrast, nodeId: TEST_ID },
    ]);
  });
});
