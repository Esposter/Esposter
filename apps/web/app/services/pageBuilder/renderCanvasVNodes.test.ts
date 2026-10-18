import type { VNode } from "vue";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_CONTEXT, TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(renderCanvasVNodes, () => {
  test("a section holding a text node stamps each node's id on its own root element", () => {
    expect.hasAssertions();

    const content = { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" };
    const section = takeOne(
      renderCanvasVNodes(
        {
          content: [
            {
              props: {
                children: [{ props: { content, id: TEST_OTHER_ID }, type: WebpageNodeType.Text }],
                id: TEST_ID,
                tag: "section",
              },
              type: WebpageNodeType.Section,
            },
          ],
          root: TEST_ROOT,
        },
        TEST_CONTEXT,
      ),
      0,
    );
    const text = takeOne(section.children as VNode[], 0);

    expect(section.props).toStrictEqual({ class: "section", "data-node-id": TEST_ID });
    expect(text.props).toStrictEqual({ class: "text", "data-node-id": TEST_OTHER_ID, innerHTML: "<p>a</p>" });
  });

  test("a custom html node renders its sanitised markup as inner html", () => {
    expect.hasAssertions();

    const custom = takeOne(
      renderCanvasVNodes(
        {
          content: [
            {
              props: { html: '<p onclick="alert(1)">Hi <b>there</b></p>', id: TEST_ID },
              type: WebpageNodeType.CustomHtml,
            },
          ],
          root: TEST_ROOT,
        },
        TEST_CONTEXT,
      ),
      0,
    );

    expect(custom.props).toStrictEqual({
      class: "custom-html",
      "data-node-id": TEST_ID,
      innerHTML: "<p>Hi <b>there</b></p>",
    });
  });
});
