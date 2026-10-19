import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { TEST_ID, TEST_OTHER_ID } from "#shared/services/pageBuilder/constants.test";
import { getNodeStyleCss } from "#shared/services/pageBuilder/getNodeStyleCss";
import { textNodeType } from "#shared/services/pageBuilder/textNodeType";
import { describe, expect, test } from "vitest";

describe(getNodeStyleCss, () => {
  test("a style applies only to the node it was set on", () => {
    expect.hasAssertions();

    const styled = {
      props: { id: TEST_ID, style: { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } } },
      type: WebpageNodeType.Text,
    };
    const plain = { props: { id: TEST_OTHER_ID }, type: WebpageNodeType.Text };

    expect({
      plain: getNodeStyleCss(plain, textNodeType),
      styled: getNodeStyleCss(styled, textNodeType),
    }).toStrictEqual({ plain: "", styled: ".pb-a {\n  color: red;\n}" });
  });

  test("a tablet override applies at 991 pixels and below", () => {
    expect.hasAssertions();

    const node = {
      props: {
        id: TEST_ID,
        style: {
          [StyleBreakpoint.Base]: { [StyleState.Default]: { "font-size": "20px" } },
          [StyleBreakpoint.Tablet]: { [StyleState.Default]: { "font-size": "16px" } },
        },
      },
      type: WebpageNodeType.Text,
    };

    expect(getNodeStyleCss(node, textNodeType)).toBe(
      ".pb-a {\n  font-size: 20px;\n}\n@media (max-width: 991px) {\n  .pb-a {\n    font-size: 16px;\n  }\n}",
    );
  });

  test("a mobile override wins over a tablet override", () => {
    expect.hasAssertions();

    const node = {
      props: {
        id: TEST_ID,
        style: {
          [StyleBreakpoint.Mobile]: { [StyleState.Default]: { "font-size": "14px" } },
          [StyleBreakpoint.Tablet]: { [StyleState.Default]: { "font-size": "16px" } },
        },
      },
      type: WebpageNodeType.Text,
    };

    expect(getNodeStyleCss(node, textNodeType)).toBe(
      "@media (max-width: 991px) {\n  .pb-a {\n    font-size: 16px;\n  }\n}\n@media (max-width: 478px) {\n  .pb-a {\n    font-size: 14px;\n  }\n}",
    );
  });

  test("a hover style also applies when a reader tabs to a button", () => {
    expect.hasAssertions();

    const node = {
      props: { id: TEST_ID, style: { [StyleBreakpoint.Base]: { [StyleState.Hover]: { color: "red" } } } },
      type: WebpageNodeType.Button,
    };

    expect(getNodeStyleCss(node, buttonNodeType)).toBe(".pb-a:hover, .pb-a:focus-visible {\n  color: red;\n}");
  });
});
