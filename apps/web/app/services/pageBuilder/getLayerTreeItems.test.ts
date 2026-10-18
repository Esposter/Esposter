import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { getLayerTreeItems } from "@/services/pageBuilder/getLayerTreeItems";
import { describe, expect, test } from "vitest";

const textContent = { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" };
const sectionId = "section";
const nestedTextId = "nestedText";
const rootTextId = "rootText";

describe(getLayerTreeItems, () => {
  test("nests a row under the nearest row one depth up, each labelled by its type's title", () => {
    expect.hasAssertions();

    const webpage: WebpageDocument = {
      content: [
        {
          props: {
            children: [{ props: { content: textContent, id: nestedTextId }, type: WebpageNodeType.Text }],
            id: sectionId,
            tag: "section",
          },
          type: WebpageNodeType.Section,
        },
        { props: { content: textContent, id: rootTextId }, type: WebpageNodeType.Text },
      ],
      root: { props: { lang: "en" } },
    };

    expect(getLayerTreeItems(webpage)).toStrictEqual([
      { children: [{ children: [], id: nestedTextId, title: "Text" }], id: sectionId, title: "Section" },
      { children: [], id: rootTextId, title: "Text" },
    ]);
  });
});
