import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_CONTEXT, TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { videoNodeType } from "#shared/services/pageBuilder/videoNodeType";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { describe, expect, test } from "vitest";

describe("videoNodeType", () => {
  test("a video without a title cannot be saved", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [{ props: { id: TEST_ID, src: TEST_URL, title: "" }, type: WebpageNodeType.Video }],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["content", 0, "props", "title"]]);
  });

  test("a video with no source is refused", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [{ props: { id: TEST_ID, title: TEST_LABEL }, type: WebpageNodeType.Video }],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["content", 0, "props", "src"]]);
  });

  test("A type's output matches for every edge value", () => {
    expect.hasAssertions();

    // The title is the accessible name and the tooltip both, so its quotes and ampersands are escaped in each
    const videos: VideoNode[] = [
      { props: { id: TEST_ID, src: TEST_URL, title: TEST_LABEL }, type: WebpageNodeType.Video },
      { props: { id: TEST_ID, src: TEST_URL, title: '"&' }, type: WebpageNodeType.Video },
    ];

    expect(videos.map((video) => serializeHtml([videoNodeType.render(video, {}, TEST_CONTEXT)]))).toStrictEqual([
      `<video aria-label="${TEST_LABEL}" class="video" controls="" preload="metadata" src="${TEST_URL}" title="${TEST_LABEL}"></video>`,
      `<video aria-label="&quot;&amp;" class="video" controls="" preload="metadata" src="${TEST_URL}" title="&quot;&amp;"></video>`,
    ]);
  });
});
