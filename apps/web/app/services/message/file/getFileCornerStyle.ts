import type { CSSProperties } from "vue";

import { CONTAINER_BORDER_RADIUS } from "@/services/message/file/constants";
import { takeOne } from "@esposter/shared";

// The grid is 12 columns wide, so a row's tile count is 12 divided by its column span: the first row's last tile
// Closes the top-right corner and the last row's first tile closes the bottom-left one
export const getFileCornerStyle = (columnLayout: number[], index: number): CSSProperties => {
  const lastIndex = columnLayout.length - 1;
  return {
    borderBottomLeftRadius:
      index === lastIndex - (12 / takeOne(columnLayout, lastIndex) - 1) ? CONTAINER_BORDER_RADIUS : undefined,
    borderBottomRightRadius: index === lastIndex ? CONTAINER_BORDER_RADIUS : undefined,
    borderTopLeftRadius: index === 0 ? CONTAINER_BORDER_RADIUS : undefined,
    borderTopRightRadius: index === 12 / takeOne(columnLayout) - 1 ? CONTAINER_BORDER_RADIUS : undefined,
  };
};
