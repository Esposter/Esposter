import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { parseClipboardNodes, serializeClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { describe, expect, test } from "vitest";

const TEST_NODE: WebpageNode = { props: { content: TEST_TEXT_CONTENT, id: TEST_ID }, type: WebpageNodeType.Text };

describe(serializeClipboardNodes, () => {
  test("a serialized node parses back to the same editor and nodes", () => {
    expect.hasAssertions();

    const text = serializeClipboardNodes({ editor: PageBuilderEditor.Webpage, nodes: [TEST_NODE] });

    expect(parseClipboardNodes(text)).toStrictEqual({ editor: PageBuilderEditor.Webpage, nodes: [TEST_NODE] });
  });

  test("text without the marker parses to undefined", () => {
    expect.hasAssertions();

    expect(
      parseClipboardNodes(JSON.stringify({ editor: PageBuilderEditor.Webpage, nodes: [TEST_NODE] })),
    ).toBeUndefined();
  });

  test("malformed json parses to undefined", () => {
    expect.hasAssertions();

    expect(parseClipboardNodes("{not json")).toBeUndefined();
  });
});
