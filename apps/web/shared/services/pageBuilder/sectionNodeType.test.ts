import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { sectionNodeType } from "#shared/services/pageBuilder/sectionNodeType";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { describe, expect, test } from "vitest";

describe("sectionNodeType", () => {
  test("a type's output matches for every edge value", () => {
    expect.hasAssertions();

    // Every semantic tag the editor offers renders as that element, with the section's class on each
    const tags = [HtmlTag.Div, HtmlTag.Footer, HtmlTag.Header, HtmlTag.Main, HtmlTag.Section] as const;

    expect(
      tags.map((tag) =>
        serializeHtml([
          sectionNodeType.render(
            { props: { children: [], id: TEST_ID, tag }, type: WebpageNodeType.Section },
            { children: [] },
          ),
        ]),
      ),
    ).toStrictEqual([
      '<div class="section"></div>',
      '<footer class="section"></footer>',
      '<header class="section"></header>',
      '<main class="section"></main>',
      '<section class="section"></section>',
    ]);
  });
});
