import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { SrgbColor } from "#shared/models/pageBuilder/SrgbColor";
import type { SurveyInviteNode } from "#shared/models/pageBuilder/SurveyInviteNode";
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_EDIT_CONTENT, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { describe } from "vitest";

export const TEST_DARK_VALUE = "#111111";
export const TEST_LIGHT_VALUE = "#f5f5f5";
export const TEST_GREY_VALUE = "#cccccc";
// The same grey as the browser computes it, which is how the editor's probe reads it
export const TEST_GREY_RGB_VALUE = "rgb(204, 204, 204)";
export const TEST_GREY_COLOR: SrgbColor = [204 / 255, 204 / 255, 204 / 255];
export const TEST_VALUE_COLOR_MAP = new Map<string, SrgbColor>([
  [TEST_DARK_VALUE, [17 / 255, 17 / 255, 17 / 255]],
  [TEST_GREY_VALUE, TEST_GREY_COLOR],
  [TEST_LIGHT_VALUE, [245 / 255, 245 / 255, 245 / 255]],
]);
export const createTestTextNode = (id: string, style: NodeStyle): TextNode => ({
  props: { content: TEST_EDIT_CONTENT, id, style },
  type: WebpageNodeType.Text,
});
export const createTestSectionNode = (id: string, children: WebpagePlaceableNode[], style: NodeStyle): SectionNode => ({
  props: { children, id, style, tag: HtmlTag.Section },
  type: WebpageNodeType.Section,
});
export const createTestSurveyInviteNode = (id: string, surveyId: string): SurveyInviteNode => ({
  props: { id, label: TEST_LABEL, surveyId },
  type: WebpageNodeType.SurveyInvite,
});

describe.todo("constants");
