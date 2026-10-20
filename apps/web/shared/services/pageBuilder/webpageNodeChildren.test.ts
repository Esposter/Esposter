import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { ColumnsNode } from "#shared/models/pageBuilder/ColumnsNode";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { TabNode } from "#shared/models/pageBuilder/TabNode";
import type { TabsNode } from "#shared/models/pageBuilder/TabsNode";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import {
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_SURVEY_ID,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { describe, expect, test } from "vitest";

describe("webpageNodeChildren", () => {
  test("each webpage node's children come from its own slots", () => {
    expect.hasAssertions();

    const button: ButtonNode = {
      props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL },
      type: WebpageNodeType.Button,
    };
    const column: ColumnNode = { props: { children: [button], id: TEST_OTHER_ID }, type: WebpageNodeType.Column };
    const columns: ColumnsNode = { props: { children: [column], id: TEST_ID }, type: WebpageNodeType.Columns };
    const tab: TabNode = {
      props: { children: [button], id: TEST_OTHER_ID, label: TEST_LABEL },
      type: WebpageNodeType.Tab,
    };
    const tabs: TabsNode = { props: { children: [tab], id: TEST_ID }, type: WebpageNodeType.Tabs };
    const section: SectionNode = {
      props: { children: [columns, tabs], id: TEST_OTHER_ID, tag: HtmlTag.Section },
      type: WebpageNodeType.Section,
    };
    const leaves: WebpageNode[] = [
      { props: { endsAt: "", endText: TEST_LABEL, id: TEST_ID }, type: WebpageNodeType.Countdown },
      { props: { html: "", id: TEST_ID }, type: WebpageNodeType.CustomHtml },
      { props: { alt: TEST_LABEL, decorative: false, id: TEST_ID, src: TEST_URL }, type: WebpageNodeType.Image },
      { props: { id: TEST_ID, label: TEST_LABEL, surveyId: TEST_SURVEY_ID }, type: WebpageNodeType.SurveyInvite },
      { props: { content: { type: "doc" }, id: TEST_ID }, type: WebpageNodeType.Text },
      { props: { id: TEST_ID, label: TEST_LABEL, text: TEST_LABEL }, type: WebpageNodeType.Tooltip },
      { props: { id: TEST_ID, texts: [TEST_LABEL] }, type: WebpageNodeType.TypedText },
      { props: { id: TEST_ID, src: TEST_URL, title: TEST_LABEL }, type: WebpageNodeType.Video },
    ];

    expect(
      [button, column, columns, section, tab, tabs, ...leaves].map((node) => webpageNodeChildren(node)),
    ).toStrictEqual([
      {},
      { children: [button] },
      { children: [column] },
      { children: [columns, tabs] },
      { children: [button] },
      { children: [tab] },
      ...leaves.map(() => ({})),
    ]);
  });
});
