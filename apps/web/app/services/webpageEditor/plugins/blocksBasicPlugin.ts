import type { BlockProperties, Editor, Plugin } from "grapesjs";

type BlockAttributeValue = number | string | string[] | Record<string, number | string>;

const addBlock = (
  editor: Editor,
  id: string,
  properties: Pick<BlockProperties, "activate" | "content" | "label" | "media">,
) => editor.Blocks.add(id, { ...properties, category: "Basic", select: true });

const basicStyle = (...styles: string[]) => `<style>${styles.join("\n")}</style>`;

const attributesToString = (attributes: Record<string, BlockAttributeValue>) =>
  Object.entries(attributes)
    .map(
      ([key, value]) =>
        `${key}='${typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}'`,
    )
    .join(" ");

export const blocksBasicPlugin: Plugin<{ flexGrid?: boolean }> = (editor, options) => {
  const isFlexGrid = options.flexGrid === true;
  const stylePrefix = "gjs-";
  const rowHeight = 75;
  const clsRow = `${stylePrefix}row`;
  const clsCell = `${stylePrefix}cell`;

  const styleRow = isFlexGrid
    ? `
    .${clsRow} {
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      flex-wrap: nowrap;
      padding: 10px;
    }
    @media (max-width: 768px) {
      .${clsRow} {
        flex-wrap: wrap;
      }
    }`
    : `
    .${clsRow} {
      display: table;
      padding: 10px;
      width: 100%;
    }
    @media (max-width: 768px) {
      .${clsCell}, .${stylePrefix}cell30, .${stylePrefix}cell70 {
        width: 100%;
        display: block;
      }
    }`;
  const styleCell = isFlexGrid
    ? `
    .${clsCell} {
      min-height: ${rowHeight}px;
      flex-grow: 1;
      flex-basis: 100%;
    }`
    : `
    .${clsCell} {
      width: 8%;
      display: table-cell;
      height: ${rowHeight}px;
    }`;
  const styleCell30 = `.${stylePrefix}cell30 { width: 30%; }`;
  const styleCell70 = `.${stylePrefix}cell70 { width: 70%; }`;

  const resizerBottom = { bc: 0, bl: 0, br: 0, cl: 0, cr: 0, minDim: 1, tc: 0, tl: 0, tr: 0 };
  const resizerRight = {
    ...resizerBottom,
    cr: 1,
    currentUnit: 1,
    step: 0.2,
    // Flex items ignore a width change, so the resizer writes flex-basis instead
    ...(isFlexGrid ? { keyWidth: "flex-basis" } : {}),
  };
  const attributesRow = attributesToString({
    class: clsRow,
    "data-gjs-droppable": `.${clsCell}`,
    "data-gjs-name": "Row",
    "data-gjs-resizable": resizerBottom,
  });
  const attributesCell = attributesToString({
    class: clsCell,
    "data-gjs-draggable": `.${clsRow}`,
    "data-gjs-name": "Cell",
    "data-gjs-resizable": resizerRight,
    ...(isFlexGrid ? { "data-gjs-stylable-require": ["flex-basis"], "data-gjs-unstylable": ["width"] } : {}),
  });
  const widthProperty = isFlexGrid ? "flex-basis" : "width";
  const createColumns = (cellContents: string[]) =>
    `<div ${attributesRow}>${cellContents.map((cellContent) => `<div ${attributesCell}${cellContent}></div>`).join("")}</div>`;

  // Private classes are hidden from the selector manager, as the upstream plugin did
  const privateClasses = new Set([`.${clsRow}`, `.${clsCell}`]);
  editor.on("selector:add", (selector) => {
    if (privateClasses.has(selector.getFullName())) selector.set("private", true);
  });

  addBlock(editor, "column1", {
    label: "1 Column",
    media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h20a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"/></svg>`,
    content: `${createColumns([""])}${basicStyle(styleRow, styleCell)}`,
  });
  addBlock(editor, "column2", {
    label: "2 Columns",
    media: `<svg viewBox="0 0 23 24"><path fill="currentColor" d="M2 20h8V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM13 20h8V4h-8v16Zm-1 0V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1Z"/></svg>`,
    content: `${createColumns(["", ""])}${basicStyle(styleRow, styleCell)}`,
  });
  addBlock(editor, "column3", {
    label: "3 Columns",
    media: `<svg viewBox="0 0 23 24"><path fill="currentColor" d="M2 20h4V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM17 20h4V4h-4v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1ZM9.5 20h4V4h-4v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z"/></svg>`,
    content: `${createColumns(["", "", ""])}${basicStyle(styleRow, styleCell)}`,
  });
  addBlock(editor, "column3-7", {
    label: "2 Columns 3/7",
    media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h5V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM10 20h12V4H10v16Zm-1 0V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1Z"/></svg>`,
    content: `${createColumns([` style='${widthProperty}: 30%;'`, ` style='${widthProperty}: 70%;'`])}${basicStyle(styleRow, styleCell, styleCell30, styleCell70)}`,
  });
  addBlock(editor, "text", {
    activate: true,
    content: { content: "Insert your text here", style: { padding: "10px" }, type: "text" },
    label: "Text",
    media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z" /></svg>`,
  });
  addBlock(editor, "link", {
    content: { content: "Link", style: { color: "#d983a6" }, type: "link" },
    label: "Link",
    media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" /></svg>`,
  });
  addBlock(editor, "image", {
    activate: true,
    content: { style: { color: "black" }, type: "image" },
    label: "Image",
    media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z" /></svg>`,
  });
  // No default src: the upstream default img/video2.webm is a file this app does not serve, so every drop 404'd
  addBlock(editor, "video", {
    content: { style: { height: "350px", width: "615px" }, type: "video" },
    label: "Video",
    media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" /></svg>`,
  });
  addBlock(editor, "map", {
    content: { style: { height: "350px" }, type: "map" },
    label: "Map",
    media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3M10,5.47L14,6.87V18.53L10,17.13V5.47M5,6.46L8,5.45V17.15L5,18.31V6.46M19,17.54L16,18.55V6.86L19,5.7V17.54Z" /></svg>`,
  });
};
