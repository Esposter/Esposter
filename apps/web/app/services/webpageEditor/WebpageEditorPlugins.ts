import type { Editor, EditorConfig } from "grapesjs";

import { usePlugin } from "grapesjs";
import grapesJSBlocksBasic from "grapesjs-blocks-basic";
import grapesJSComponentCountdown from "grapesjs-component-countdown";
import grapesJSCustomCode from "grapesjs-custom-code";
import grapesJSParserPostcss from "grapesjs-parser-postcss";
import grapesJSPluginExport from "grapesjs-plugin-export";
import grapesJSPluginForms from "grapesjs-plugin-forms";
import grapesJSPresetWebpage from "grapesjs-preset-webpage";
import grapesJSStyleBg from "grapesjs-style-bg";
// @ts-expect-error no d.ts file
import grapesJSTabs from "grapesjs-tabs";
import grapesJSTooltip from "grapesjs-tooltip";
// @ts-expect-error no d.ts file
import grapesJSTouch from "grapesjs-touch";
import grapesJSTuiImageEditor from "grapesjs-tui-image-editor";
import grapesJSTyped from "grapesjs-typed";
import jsBeautify from "js-beautify";

const { css: cssFormat, html: htmlFormat } = jsBeautify;

export const WebpageEditorPlugins: EditorConfig["plugins"] = [
  usePlugin(grapesJSBlocksBasic, {
    flexGrid: true,
  }),
  grapesJSPluginForms,
  grapesJSComponentCountdown,
  grapesJSPluginExport,
  usePlugin(grapesJSTabs, {
    tabsBlock: { category: "Extra" },
  }),
  grapesJSCustomCode,
  grapesJSTouch,
  grapesJSParserPostcss,
  grapesJSTooltip,
  grapesJSTuiImageEditor,
  usePlugin(grapesJSTyped, {
    block: {
      category: "Extra",
      content: {
        strings: ["Text row one", "Text row two", "Text row three"],
        type: "typed",
        "type-speed": 40,
      },
    },
  }),
  grapesJSStyleBg,
  usePlugin(grapesJSPresetWebpage, {
    modalImportContent: (editorInstance: Editor) => {
      const html = editorInstance.getHtml();
      const css = editorInstance.getCss();
      return css ? `${htmlFormat(html)}<style>\n${cssFormat(css)}</style>` : htmlFormat(html);
    },
    modalImportLabel: "<div text-title-small mb-2.5>Paste here your HTML/CSS and click Import</div>",
    modalImportTitle: "Import Template",
  }),
];
