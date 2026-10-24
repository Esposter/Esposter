import { DropIndicatorKind } from "@/models/pageBuilder/DropIndicatorKind";
import { getDropIndicatorBox } from "@/services/pageBuilder/getDropIndicatorBox";
import { describe, expect, test } from "vitest";

describe(getDropIndicatorBox, () => {
  const FIRST_BOX = { height: 40, left: 0, top: 0, width: 200 };
  const SECOND_BOX = { height: 40, left: 0, top: 50, width: 200 };
  const OWNER_BOX = { height: 300, left: 0, top: 0, width: 200 };

  test("an indicator between two children sits in the gap between them", () => {
    expect.hasAssertions();

    expect(
      getDropIndicatorBox({ childBoxes: [FIRST_BOX, SECOND_BOX], index: 1, isHorizontal: false, ownerBox: OWNER_BOX }),
    ).toStrictEqual({ box: { height: 2, left: 0, top: 44, width: 200 }, kind: DropIndicatorKind.Line });
  });

  test("an indicator skips an unmeasured child to sit in the gap between the measured ones", () => {
    expect.hasAssertions();

    expect(
      getDropIndicatorBox({
        childBoxes: [FIRST_BOX, undefined, SECOND_BOX],
        index: 2,
        isHorizontal: false,
        ownerBox: OWNER_BOX,
      }),
    ).toStrictEqual({ box: { height: 2, left: 0, top: 44, width: 200 }, kind: DropIndicatorKind.Line });
  });

  test("an indicator in an empty slot outlines its owner", () => {
    expect.hasAssertions();

    expect(getDropIndicatorBox({ childBoxes: [], index: 0, isHorizontal: false, ownerBox: OWNER_BOX })).toStrictEqual({
      box: OWNER_BOX,
      kind: DropIndicatorKind.Outline,
    });
  });
});
