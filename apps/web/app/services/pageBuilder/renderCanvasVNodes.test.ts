import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_CONTEXT, TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";
import { isVNode } from "vue";

describe(renderCanvasVNodes, () => {
  test("a section holding a text node stamps each node's id on its own root element", () => {
    expect.hasAssertions();

    const content = { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" };
    const section = takeOne(
      renderCanvasVNodes(
        webpageKind,
        {
          content: [
            {
              props: {
                children: [{ props: { content, id: TEST_OTHER_ID }, type: WebpageNodeType.Text }],
                id: TEST_ID,
                tag: HtmlTag.Section,
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
    assert(Array.isArray(section.children));
    const text = takeOne(section.children, 0);
    assert(isVNode(text));

    expect(section.props).toStrictEqual({ class: "section", "data-node-id": TEST_ID });
    expect(text.props).toStrictEqual({ class: "text", "data-node-id": TEST_OTHER_ID, innerHTML: "<p>a</p>" });
  });

  test("a custom html node renders its sanitised markup as inner html", () => {
    expect.hasAssertions();

    const custom = takeOne(
      renderCanvasVNodes(
        webpageKind,
        {
          content: [
            { props: { html: '<p onclick="alert(1)">a <b>b</b></p>', id: TEST_ID }, type: WebpageNodeType.CustomHtml },
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
      innerHTML: "<p>a <b>b</b></p>",
    });
  });
});
