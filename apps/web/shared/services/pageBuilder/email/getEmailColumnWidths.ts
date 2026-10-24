import type { MjmlColumnNode } from "mjml-blocks";

import { getBlockPropValue } from "headless-block-editor";

const PERCENT_UNIT = "%";

// The width each of a section's columns takes: a column's own width when it sets one, else an equal share of the
// Percentage the set widths leave. A column that sets a pixel width keeps it, and takes none of the share
export const getEmailColumnWidths = (columns: MjmlColumnNode[]): string[] => {
  const widths = columns.map((column) => {
    const width = getBlockPropValue(column.props, "width");
    return typeof width === "string" ? width : undefined;
  });
  const setPercent = widths.reduce(
    (total, width) => (width?.endsWith(PERCENT_UNIT) ? total + Number(width.slice(0, -PERCENT_UNIT.length)) : total),
    0,
  );
  const unsetCount = widths.filter((width) => width === undefined).length;
  const share = unsetCount === 0 ? 0 : (100 - setPercent) / unsetCount;

  return widths.map((width) => width ?? `${share}${PERCENT_UNIT}`);
};
