import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import {
  TEST_ID,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_SURVEY_ID,
  TEST_THIRD_ID,
} from "#shared/services/pageBuilder/constants.test";
import {
  createTestSectionNode,
  createTestSurveyInviteNode,
  createTestTextNode,
  TEST_DARK_VALUE,
  TEST_GREY_VALUE,
  TEST_LIGHT_VALUE,
  TEST_VALUE_COLOR_MAP,
} from "#shared/services/pageBuilder/critique/constants.test";
import { critiqueWebpage } from "#shared/services/pageBuilder/critique/critiqueWebpage";
import { describe, expect, test } from "vitest";

describe(critiqueWebpage, () => {
  test("text is checked against the background its section sets", () => {
    expect.hasAssertions();

    const text = createTestTextNode(TEST_OTHER_ID, {});
    const section = createTestSectionNode(TEST_ID, [text], {
      [StyleBreakpoint.Base]: {
        [StyleState.Default]: { "background-color": TEST_DARK_VALUE, color: TEST_LIGHT_VALUE },
      },
    });
    const document: WebpageDocument = { content: [section], root: TEST_ROOT };
    const sources: CritiqueSources = {
      lookupSurveyPublishState: () => SurveyPublishState.Published,
      readColor: (value) => TEST_VALUE_COLOR_MAP.get(value),
    };

    expect(critiqueWebpage(document, sources)).toStrictEqual([]);
  });

  test("every check reports through the one function, in document order", () => {
    expect.hasAssertions();

    const text = createTestTextNode(TEST_OTHER_ID, {
      [StyleBreakpoint.Base]: { [StyleState.Default]: { color: TEST_GREY_VALUE } },
    });
    const section = createTestSectionNode(TEST_ID, [text], {
      [StyleBreakpoint.Base]: { [StyleState.Default]: { width: "800px" } },
    });
    const invite = createTestSurveyInviteNode(TEST_THIRD_ID, TEST_SURVEY_ID);
    const document: WebpageDocument = { content: [section, invite], root: TEST_ROOT };
    const sources: CritiqueSources = {
      lookupSurveyPublishState: () => SurveyPublishState.Unpublished,
      readColor: (value) => TEST_VALUE_COLOR_MAP.get(value),
    };

    expect(critiqueWebpage(document, sources)).toStrictEqual([
      { kind: CritiqueFindingKind.WideFixedWidth, nodeId: TEST_ID, phoneWidthInPixels: 800 },
      { contrastRatio: 1.6059285649, kind: CritiqueFindingKind.LowContrast, nodeId: TEST_OTHER_ID },
      { kind: CritiqueFindingKind.UnpublishedSurvey, nodeId: TEST_THIRD_ID },
    ]);
  });

  test("an unreadable colour is reported unchecked", () => {
    expect.hasAssertions();

    const text = createTestTextNode(TEST_OTHER_ID, {
      [StyleBreakpoint.Base]: { [StyleState.Default]: { color: TEST_GREY_VALUE } },
    });
    const document: WebpageDocument = { content: [text], root: TEST_ROOT };
    const sources: CritiqueSources = {
      lookupSurveyPublishState: () => SurveyPublishState.Published,
      readColor: () => undefined,
    };

    expect(critiqueWebpage(document, sources)).toStrictEqual([
      { kind: CritiqueFindingKind.UncheckedContrast, nodeId: TEST_OTHER_ID },
    ]);
  });

  test("a survey lookup that fails leaves the invite unchecked", () => {
    expect.hasAssertions();

    const invite = createTestSurveyInviteNode(TEST_OTHER_ID, TEST_SURVEY_ID);
    const document: WebpageDocument = { content: [invite], root: TEST_ROOT };
    const sources: CritiqueSources = {
      lookupSurveyPublishState: () => SurveyPublishState.Unreadable,
      readColor: () => undefined,
    };

    expect(critiqueWebpage(document, sources)).toStrictEqual([
      { kind: CritiqueFindingKind.UncheckedSurvey, nodeId: TEST_OTHER_ID },
    ]);
  });
});
