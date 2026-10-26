import type { EmailCanvasDrawing } from "@/models/pageBuilder/EmailCanvasDrawing";
import type { MjmlNode, MjmlNodeType } from "mjml-blocks";

import { checkIsColumn } from "#shared/services/pageBuilder/email/checkIsColumn";
import { getEmailColumnWidths } from "#shared/services/pageBuilder/email/getEmailColumnWidths";
import { takeOne } from "@esposter/shared";
import { getBlockSlots } from "headless-block-editor";

// A section lays its columns side by side, and stacks them at the canvas width the mobile breakpoint covers
export const drawSection: EmailCanvasDrawing<MjmlNodeType.Section> = (
  node,
  { attribute, childNodes, isStacked, kind },
) => {
  const children = Object.values(getBlockSlots<MjmlNode>(kind.children, node)).flat();
  const columns = children.filter((child) => checkIsColumn(child));
  const widths = getEmailColumnWidths(columns);
  // A child that is not a column takes the whole row, and a column takes the width of its own place among the columns
  const childWidths = children.map((child) =>
    checkIsColumn(child) ? takeOne(widths, columns.indexOf(child)) : "100%",
  );

  return h(
    "div",
    {
      style: {
        backgroundColor: attribute("background-color"),
        display: "flex",
        flexDirection: isStacked ? "column" : "row",
        padding: attribute("padding"),
      },
    },
    childNodes.map((child, index) =>
      h("div", { style: { minWidth: 0, width: isStacked ? "100%" : takeOne(childWidths, index) } }, [child]),
    ),
  );
};
