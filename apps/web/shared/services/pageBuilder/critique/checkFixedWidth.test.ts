import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { checkFixedWidth } from "#shared/services/pageBuilder/critique/checkFixedWidth";
import { createTestSectionNode } from "#shared/services/pageBuilder/critique/constants.test";
import { describe, expect, test } from "vitest";

describe(checkFixedWidth, () => {
  const wideBaseStyle = { [StyleBreakpoint.Base]: { [StyleState.Default]: { width: "800px" } } };

  test("a fixed width with no mobile override is reported", () => {
    expect.hasAssertions();

    const section = createTestSectionNode(TEST_ID, [], wideBaseStyle);

    expect(checkFixedWidth(section)).toStrictEqual([
      { kind: CritiqueFindingKind.WideFixedWidth, nodeId: TEST_ID, phoneWidthInPixels: 800 },
    ]);
  });

  test("a mobile override that narrows the node is not reported", () => {
    expect.hasAssertions();

    const section = createTestSectionNode(TEST_ID, [], {
      ...wideBaseStyle,
      [StyleBreakpoint.Mobile]: { [StyleState.Default]: { width: "320px" } },
    });

    expect(checkFixedWidth(section)).toStrictEqual([]);
  });

  test("a tablet override that narrows the node is not reported", () => {
    expect.hasAssertions();

    const section = createTestSectionNode(TEST_ID, [], {
      ...wideBaseStyle,
      [StyleBreakpoint.Tablet]: { [StyleState.Default]: { width: "320px" } },
    });

    expect(checkFixedWidth(section)).toStrictEqual([]);
  });

  test.each([
    ["30rem", 480],
    ["120vw", 450],
  ])("a width of %s is read in pixels at the phone", (width, phoneWidthInPixels) => {
    expect.hasAssertions();

    const section = createTestSectionNode(TEST_ID, [], { [StyleBreakpoint.Base]: { [StyleState.Default]: { width } } });

    expect(checkFixedWidth(section)).toStrictEqual([
      { kind: CritiqueFindingKind.WideFixedWidth, nodeId: TEST_ID, phoneWidthInPixels },
    ]);
  });

  test("a width that is not a fixed length is not reported", () => {
    expect.hasAssertions();

    const section = createTestSectionNode(TEST_ID, [], {
      [StyleBreakpoint.Base]: { [StyleState.Default]: { width: "100%" } },
    });

    expect(checkFixedWidth(section)).toStrictEqual([]);
  });
});
