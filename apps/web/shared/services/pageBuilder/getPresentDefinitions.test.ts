import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { sectionNodeType } from "#shared/services/pageBuilder/sectionNodeType";
import { describe, expect, test } from "vitest";

describe(getPresentDefinitions, () => {
  test("a type held many times is returned once, in registry order, beside the other types it holds", () => {
    expect.hasAssertions();

    const definitions = getPresentDefinitions({
      content: [
        {
          props: {
            children: [
              { props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
              { props: { href: TEST_URL, id: TEST_OTHER_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
            ],
            id: TEST_ID,
            tag: "section",
          },
          type: WebpageNodeType.Section,
        },
      ],
      root: TEST_ROOT,
    });

    expect(definitions).toStrictEqual([buttonNodeType, sectionNodeType]);
  });
});
