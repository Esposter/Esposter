import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import {
  TEST_ID,
  TEST_LABEL,
  TEST_LANG,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { describe, expect, test } from "vitest";

// A page of one button whose colour is the theme's brand colour, with the brand colour set to the one given
const getBrandPageCss = (brand: string) =>
  getWebpageCss(
    {
      content: [
        {
          props: {
            href: TEST_URL,
            id: TEST_ID,
            label: TEST_LABEL,
            style: { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "var(--color-brand)" } } },
          },
          type: WebpageNodeType.Button,
        },
      ],
      root: { props: { lang: TEST_LANG, tokens: { "color-brand": brand } } },
    },
    [buttonNodeType],
  );

describe(getWebpageCss, () => {
  test("changing a theme colour recolours every node that uses it", () => {
    expect.hasAssertions();

    // The node names the token rather than the colour, so its rule is the same whichever colour the theme holds
    const nodeRule = `.pb-${TEST_ID} {\n  color: var(--color-brand);\n}`;

    expect(getBrandPageCss("#ff0000")).toBe(
      `:root {\n  --color-brand: #ff0000;\n}\n${buttonNodeType.css}\n${nodeRule}`,
    );
    expect(getBrandPageCss("#00ff00")).toBe(
      `:root {\n  --color-brand: #00ff00;\n}\n${buttonNodeType.css}\n${nodeRule}`,
    );
  });

  test("the page css joins the css of the definitions it is given, then the style rules", () => {
    expect.hasAssertions();

    const css = getWebpageCss(
      {
        content: [
          { props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
          {
            props: {
              href: TEST_URL,
              id: TEST_OTHER_ID,
              label: TEST_LABEL,
              style: { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } },
            },
            type: WebpageNodeType.Button,
          },
        ],
        root: TEST_ROOT,
      },
      [buttonNodeType],
    );

    expect(css).toBe(`${buttonNodeType.css}\n.pb-${TEST_OTHER_ID} {\n  color: red;\n}`);
  });
});
