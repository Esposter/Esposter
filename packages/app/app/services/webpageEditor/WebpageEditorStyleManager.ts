import type { EditorConfig } from "grapesjs";

export const WebpageEditorStyleManager: EditorConfig["styleManager"] = {
  sectors: [
    {
      name: "General",
      properties: [
        {
          default: "none",
          extend: "float",
          options: [
            { className: "fa fa-times", id: "times", value: "none" },
            { className: "fa fa-align-left", id: "left", value: "left" },
            { className: "fa fa-align-right", id: "right", value: "right" },
          ],
          type: "radio",
        },
        "display",
        { extend: "position", type: "select" },
        "top",
        "right",
        "left",
        "bottom",
      ],
    },
    {
      name: "Dimension",
      open: false,
      properties: [
        "width",
        {
          id: "flex-width",
          name: "Width",
          property: "flex-basis",
          toRequire: true,
          type: "integer",
          units: ["px", "%"],
        },
        "height",
        "max-width",
        "min-height",
        "margin",
        "padding",
      ],
    },
    {
      name: "Typography",
      open: false,
      properties: [
        "font-family",
        "font-size",
        "font-weight",
        "letter-spacing",
        "color",
        "line-height",
        {
          extend: "text-align",
          options: [
            { className: "fa fa-align-left", id: "left", label: "Left" },
            { className: "fa fa-align-center", id: "center", label: "Center" },
            { className: "fa fa-align-right", id: "right", label: "Right" },
            { className: "fa fa-align-justify", id: "justify", label: "Justify" },
          ],
        },
        {
          default: "none",
          options: [
            { className: "fa fa-times", id: "none", label: "None" },
            { className: "fa fa-underline", id: "underline", label: "underline" },
            { className: "fa fa-strikethrough", id: "line-through", label: "Line-through" },
          ],
          property: "text-decoration",
          type: "radio",
        },
        "text-shadow",
      ],
    },
    {
      name: "Decorations",
      open: false,
      properties: ["opacity", "border-radius", "border", "box-shadow", "background"],
    },
    {
      buildProps: ["transition", "perspective", "transform"],
      name: "Extra",
      open: false,
    },
    {
      name: "Flex",
      open: false,
      properties: [
        {
          defaults: "block",
          list: [
            { id: "disable", name: "Disable", value: "block" },
            { id: "enable", name: "Enable", value: "flex" },
          ],
          name: "Flex Container",
          property: "display",
          type: "select",
        },
        {
          name: "Flex Parent",
          property: "label-parent-flex",
          type: "integer",
        },
        {
          defaults: "row",
          list: [
            {
              className: "icons-flex icon-dir-row",
              id: "row",
              name: "Row",
              title: "Row",
              value: "row",
            },
            {
              className: "icons-flex icon-dir-row-rev",
              id: "row-reverse",
              name: "Row reverse",
              title: "Row reverse",
              value: "row-reverse",
            },
            {
              className: "icons-flex icon-dir-col",
              id: "column",
              name: "Column",
              title: "Column",
              value: "column",
            },
            {
              className: "icons-flex icon-dir-col-rev",
              id: "column-reverse",
              name: "Column reverse",
              title: "Column reverse",
              value: "column-reverse",
            },
          ],
          name: "Direction",
          property: "flex-direction",
          type: "radio",
        },
        {
          defaults: "flex-start",
          list: [
            {
              className: "icons-flex icon-just-start",
              id: "flex-start",
              title: "Start",
              value: "flex-start",
            },
            {
              className: "icons-flex icon-just-end",
              id: "flex-end",
              title: "End",
              value: "flex-end",
            },
            {
              className: "icons-flex icon-just-sp-bet",
              id: "space-between",
              title: "Space between",
              value: "space-between",
            },
            {
              className: "icons-flex icon-just-sp-ar",
              id: "space-around",
              title: "Space around",
              value: "space-around",
            },
            {
              className: "icons-flex icon-just-sp-cent",
              id: "center",
              title: "Center",
              value: "center",
            },
          ],
          name: "Justify",
          property: "justify-content",
          type: "radio",
        },
        {
          defaults: "center",
          list: [
            {
              className: "icons-flex icon-al-start",
              id: "flex-start",
              title: "Start",
              value: "flex-start",
            },
            {
              className: "icons-flex icon-al-end",
              id: "flex-end",
              title: "End",
              value: "flex-end",
            },
            {
              className: "icons-flex icon-al-str",
              id: "stretch",
              title: "Stretch",
              value: "stretch",
            },
            {
              className: "icons-flex icon-al-center",
              id: "center",
              title: "Center",
              value: "center",
            },
          ],
          name: "Align",
          property: "align-items",
          type: "radio",
        },
        {
          name: "Flex Children",
          property: "label-parent-flex",
          type: "integer",
        },
        {
          defaults: "0",
          min: 0,
          name: "Order",
          property: "order",
          type: "integer",
        },
        {
          name: "Flex",
          properties: [
            {
              defaults: "0",
              min: 0,
              name: "Grow",
              property: "flex-grow",
              type: "integer",
            },
            {
              defaults: "0",
              min: 0,
              name: "Shrink",
              property: "flex-shrink",
              type: "integer",
            },
            {
              defaults: "auto",
              name: "Basis",
              property: "flex-basis",
              type: "integer",
              unit: "",
              units: ["px", "%", ""],
            },
          ],
          property: "flex",
          type: "composite",
        },
        {
          defaults: "auto",
          list: [
            {
              id: "auto",
              name: "Auto",
              value: "auto",
            },
            {
              className: "icons-flex icon-al-start",
              id: "flex-start",
              title: "Start",
              value: "flex-start",
            },
            {
              className: "icons-flex icon-al-end",
              id: "flex-end",
              title: "End",
              value: "flex-end",
            },
            {
              className: "icons-flex icon-al-str",
              id: "stretch",
              title: "Stretch",
              value: "stretch",
            },
            {
              className: "icons-flex icon-al-center",
              id: "center",
              title: "Center",
              value: "center",
            },
          ],
          name: "Align",
          property: "align-self",
          type: "radio",
        },
      ],
    },
  ],
};
