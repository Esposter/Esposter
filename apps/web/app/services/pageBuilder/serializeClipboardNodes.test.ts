import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { parseClipboardNodes, serializeClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { describe, expect, test } from "vitest";

const TEST_NODE = { props: { content: TEST_ID, id: TEST_ID }, type: WebpageNodeType.Text };

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
