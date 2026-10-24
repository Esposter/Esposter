import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";
import type { EmailKind } from "@/models/pageBuilder/EmailKind";
import type { MjmlNode } from "mjml-blocks";
import type { VNode } from "vue";

import { checkIsColumn } from "#shared/services/pageBuilder/email/checkIsColumn";
import { checkIsStackedColumns } from "#shared/services/pageBuilder/email/checkIsStackedColumns";
import { getEmailAttributeValue } from "#shared/services/pageBuilder/email/getEmailAttributeValue";
import { getEmailColumnWidths } from "#shared/services/pageBuilder/email/getEmailColumnWidths";
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { takeOne } from "@esposter/shared";
import { getBlockSlots, renderBlockNodes } from "headless-block-editor";
import { MjmlNodeType } from "mjml-blocks";
import { h } from "vue";

// The design canvas's view of an email: each node drawn as the element it becomes.
// Every attribute is the one the MJML cascade resolves for it.
// A section lays its columns side by side, and stacks them at the canvas width the mobile breakpoint covers.
// A leaf without a drawing of its own is labelled with its type, so the tree stays visible while it is drawn
export const renderEmailCanvasVNodes = (kind: EmailKind, document: EmailDocument, width: number): VNode[] => {
  const rootAttributes = document.root.props.attributes;
  const isStacked = checkIsStackedColumns(width);

  return renderBlockNodes(document.content, kind.registry, kind.children, (node, _definition, slots) => {
    const attribute = (name: string) => getEmailAttributeValue(node, name, rootAttributes);
    const childNodes = Object.values(slots).flat();

    if (node.type === MjmlNodeType.Section) {
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
    }

    if (node.type === MjmlNodeType.Text)
      return h("div", {
        innerHTML: renderNoteHtml(node.props.content),
        style: {
          color: attribute("color"),
          fontFamily: attribute("font-family"),
          fontSize: attribute("font-size"),
          lineHeight: attribute("line-height"),
          padding: attribute("padding"),
          textAlign: attribute("align"),
        },
      });

    if (childNodes.length > 0)
      return h(
        "div",
        { style: { backgroundColor: attribute("background-color"), padding: attribute("padding") } },
        childNodes,
      );

    return h("div", { style: { padding: attribute("padding") } }, node.type);
  });
};
