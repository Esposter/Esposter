import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { videoNodeType } from "#shared/services/pageBuilder/videoNodeType";
import { describe, expect, test } from "vitest";

describe("videoNodeType", () => {
  test("a type's output matches for every edge value", () => {
    expect.hasAssertions();

    // The title is the accessible name and the tooltip both, so its quotes and ampersands are escaped in each
    const videos: VideoNode[] = [
      { props: { id: TEST_ID, src: TEST_URL, title: TEST_LABEL }, type: WebpageNodeType.Video },
      { props: { id: TEST_ID, src: TEST_URL, title: '"&' }, type: WebpageNodeType.Video },
    ];

    expect(videos.map((video) => serializeHtml([videoNodeType.render(video)]))).toStrictEqual([
      `<video aria-label="${TEST_LABEL}" class="video" controls="" preload="metadata" src="${TEST_URL}" title="${TEST_LABEL}"></video>`,
      `<video aria-label="&quot;&amp;" class="video" controls="" preload="metadata" src="${TEST_URL}" title="&quot;&amp;"></video>`,
    ]);
  });
});
