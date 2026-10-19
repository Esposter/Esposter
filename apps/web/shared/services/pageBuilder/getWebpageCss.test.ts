import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { describe, expect, test } from "vitest";

describe(getWebpageCss, () => {
  test("the page css holds each type's css once and then the style rules", () => {
    expect.hasAssertions();

    const css = getWebpageCss({
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
    });

    expect(css).toBe(`${buttonNodeType.css}\n.pb-${TEST_OTHER_ID} {\n  color: red;\n}`);
  });
});
