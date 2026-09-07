import { CONTAINER_BORDER_RADIUS } from "@/services/message/file/constants";
import { getColumnLayout } from "@/services/message/file/getColumnLayout";
import { getFileCornerStyle } from "@/services/message/file/getFileCornerStyle";
import { describe, expect, test } from "vitest";

describe(getFileCornerStyle, () => {
  test("rounds every corner of a lone tile", () => {
    expect.hasAssertions();

    expect(getFileCornerStyle(getColumnLayout(1), 0)).toStrictEqual({
      borderBottomLeftRadius: CONTAINER_BORDER_RADIUS,
      borderBottomRightRadius: CONTAINER_BORDER_RADIUS,
      borderTopLeftRadius: CONTAINER_BORDER_RADIUS,
      borderTopRightRadius: CONTAINER_BORDER_RADIUS,
    });
  });

  // [6, 6, 4, 4, 4] — two tiles on the first row, three on the last, so the rounded tiles are 0/1 and 2/4
  test("rounds only the outer tiles of a ragged grid", () => {
    expect.hasAssertions();

    const columnLayout = getColumnLayout(5);

    expect(columnLayout.map((_columns, index) => getFileCornerStyle(columnLayout, index))).toStrictEqual([
      {
        borderBottomLeftRadius: undefined,
        borderBottomRightRadius: undefined,
        borderTopLeftRadius: CONTAINER_BORDER_RADIUS,
        borderTopRightRadius: undefined,
      },
      {
        borderBottomLeftRadius: undefined,
        borderBottomRightRadius: undefined,
        borderTopLeftRadius: undefined,
        borderTopRightRadius: CONTAINER_BORDER_RADIUS,
      },
      {
        borderBottomLeftRadius: CONTAINER_BORDER_RADIUS,
        borderBottomRightRadius: undefined,
        borderTopLeftRadius: undefined,
        borderTopRightRadius: undefined,
      },
      {
        borderBottomLeftRadius: undefined,
        borderBottomRightRadius: undefined,
        borderTopLeftRadius: undefined,
        borderTopRightRadius: undefined,
      },
      {
        borderBottomLeftRadius: undefined,
        borderBottomRightRadius: CONTAINER_BORDER_RADIUS,
        borderTopLeftRadius: undefined,
        borderTopRightRadius: undefined,
      },
    ]);
  });
});
