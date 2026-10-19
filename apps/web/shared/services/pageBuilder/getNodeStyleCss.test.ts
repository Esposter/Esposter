import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";

import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { getNodeStyleCss } from "#shared/services/pageBuilder/getNodeStyleCss";
import { describe, expect, test } from "vitest";

// A button node with the given id, holding the style when one is given
const createButtonNode = (id: string, style?: NodeStyle): ButtonNode => ({
  props: { href: TEST_URL, id, label: TEST_LABEL, style },
  type: WebpageNodeType.Button,
});

describe(getNodeStyleCss, () => {
  test("a style applies only to the node it was set on", () => {
    expect.hasAssertions();

    const styled = createButtonNode(TEST_ID, { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } });
    const plain = createButtonNode(TEST_OTHER_ID);

    expect({
      plain: getNodeStyleCss(plain, buttonNodeType),
      styled: getNodeStyleCss(styled, buttonNodeType),
    }).toStrictEqual({ plain: "", styled: ".pb-a {\n  color: red;\n}" });
  });

  test("a tablet override applies at 991 pixels and below", () => {
    expect.hasAssertions();

    const node = createButtonNode(TEST_ID, {
      [StyleBreakpoint.Base]: { [StyleState.Default]: { "font-size": "20px" } },
      [StyleBreakpoint.Tablet]: { [StyleState.Default]: { "font-size": "16px" } },
    });

    expect(getNodeStyleCss(node, buttonNodeType)).toBe(
      ".pb-a {\n  font-size: 20px;\n}\n@media (max-width: 991px) {\n  .pb-a {\n    font-size: 16px;\n  }\n}",
    );
  });

  test("a mobile override wins over a tablet override", () => {
    expect.hasAssertions();

    const node = createButtonNode(TEST_ID, {
      [StyleBreakpoint.Mobile]: { [StyleState.Default]: { "font-size": "14px" } },
      [StyleBreakpoint.Tablet]: { [StyleState.Default]: { "font-size": "16px" } },
    });

    expect(getNodeStyleCss(node, buttonNodeType)).toBe(
      "@media (max-width: 991px) {\n  .pb-a {\n    font-size: 16px;\n  }\n}\n@media (max-width: 478px) {\n  .pb-a {\n    font-size: 14px;\n  }\n}",
    );
  });

  test("a hover style also applies when a reader tabs to a button", () => {
    expect.hasAssertions();

    const node = createButtonNode(TEST_ID, { [StyleBreakpoint.Base]: { [StyleState.Hover]: { color: "red" } } });

    expect(getNodeStyleCss(node, buttonNodeType)).toBe(".pb-a:hover, .pb-a:focus-visible {\n  color: red;\n}");
  });
});
