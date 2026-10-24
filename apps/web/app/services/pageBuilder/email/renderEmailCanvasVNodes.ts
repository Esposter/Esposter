import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";
import type { EmailKind } from "@/models/pageBuilder/EmailKind";
import type { MjmlColumnNode, MjmlNode } from "mjml-blocks";
import type { VNode } from "vue";

import { checkIsStackedColumns } from "#shared/services/pageBuilder/email/checkIsStackedColumns";
import { getEmailAttributeValue } from "#shared/services/pageBuilder/email/getEmailAttributeValue";
import { getEmailColumnWidths } from "#shared/services/pageBuilder/email/getEmailColumnWidths";
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { takeOne } from "@esposter/shared";
import { getBlockSlots, renderBlockNodes } from "headless-block-editor";
import { MjmlNodeType } from "mjml-blocks";
import { h } from "vue";

const checkIsColumn = (node: MjmlNode): node is MjmlColumnNode => node.type === MjmlNodeType.Column;

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
      const columns = Object.values(getBlockSlots(kind.children, node))
        .flat()
        .filter((child) => checkIsColumn(child));
      const widths = getEmailColumnWidths(columns);

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
        childNodes.map((column, index) =>
          h("div", { style: { minWidth: 0, width: isStacked ? "100%" : takeOne(widths, index) } }, [column]),
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
