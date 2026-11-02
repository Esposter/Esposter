import type { SrgbColor } from "#shared/models/shared/SrgbColor";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { checkTextContrast } from "#shared/services/pageBuilder/critique/checkTextContrast";
import { PAGE_BACKGROUND_COLOR, PAGE_TEXT_COLOR } from "#shared/services/pageBuilder/critique/constants";
import { createTestTextNode, TEST_GREY_COLOR } from "#shared/services/pageBuilder/critique/constants.test";
import { describe, expect, test } from "vitest";

describe(checkTextContrast, () => {
  test("low-contrast text is reported with its node", () => {
    expect.hasAssertions();

    const text = createTestTextNode(TEST_ID, {});

    expect(checkTextContrast(text, { background: PAGE_BACKGROUND_COLOR, textColor: TEST_GREY_COLOR })).toStrictEqual([
      { contrastRatio: 1.6059285649, kind: CritiqueFindingKind.LowContrast, nodeId: TEST_ID },
    ]);
  });

  test("text at exactly 4.5 to 1 is not reported", () => {
    expect.hasAssertions();

    // The grey whose relative luminance is 0.175, so its ratio with black is exactly 4.5 to 1
    const exactRatioGrey: SrgbColor = [0.4553306431077955, 0.4553306431077955, 0.4553306431077955];
    const text = createTestTextNode(TEST_ID, {});

    expect(checkTextContrast(text, { background: [0, 0, 0], textColor: exactRatioGrey })).toStrictEqual([]);
  });

  test.each([
    ["text colour", { background: PAGE_BACKGROUND_COLOR }],
    ["background", { textColor: PAGE_TEXT_COLOR }],
  ])("an unreadable %s is reported unchecked", (_, colors) => {
    expect.hasAssertions();

    const text = createTestTextNode(TEST_ID, {});

    expect(checkTextContrast(text, colors)).toStrictEqual([
      { kind: CritiqueFindingKind.UncheckedContrast, nodeId: TEST_ID },
    ]);
  });
});
