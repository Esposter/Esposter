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

// The CSS property each MJML attribute the canvas draws is written as. An attribute its node's component does not take is
// Not drawn, so a link's href or an image's source never reaches the style
const CANVAS_STYLE_PROPERTY_MAP: Readonly<Record<string, string>> = Object.freeze({
  align: "textAlign",
  "background-color": "backgroundColor",
  "border-radius": "borderRadius",
  color: "color",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  height: "height",
  "line-height": "lineHeight",
  padding: "padding",
});

// The design canvas's view of an email: each node drawn as the element it becomes.
// Every attribute is the one the MJML cascade resolves for it.
// A section lays its columns side by side, and stacks them at the canvas width the mobile breakpoint covers.
// A leaf without a drawing of its own draws the attributes its component takes and is labelled with its type, so the tree stays visible
export const renderEmailCanvasVNodes = (kind: EmailKind, document: EmailDocument, width: number): VNode[] => {
  const rootAttributes = document.root.props.attributes;
  const isStacked = checkIsStackedColumns(width);

  return renderBlockNodes(document.content, kind.registry, kind.children, (node, definition, slots) => {
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

    // Only the attributes the component declares are drawn, since the cascade's root-wide defaults reach every tag
    const style = Object.fromEntries(
      Object.entries(CANVAS_STYLE_PROPERTY_MAP)
        .filter(([name]) => Object.hasOwn(definition.allowedAttributes, name))
        .map(([name, property]) => [property, attribute(name)]),
    );

    if (node.type === MjmlNodeType.Text) return h("div", { innerHTML: renderNoteHtml(node.props.content), style });

    // A divider is drawn as the rule its border attributes name, since a rule is what it is
    if (node.type === MjmlNodeType.Divider)
      return h("div", {
        style: {
          ...style,
          borderTop: `${attribute("border-width")} ${attribute("border-style")} ${attribute("border-color")}`,
        },
      });

    return h("div", { style }, childNodes.length > 0 ? childNodes : node.type);
  });
};
