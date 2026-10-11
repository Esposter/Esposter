// @unocss-include
import type { Editor, EditorConfig } from "grapesjs";

import { usePlugin } from "grapesjs";
import { blocksBasicPlugin } from "@/services/webpageEditor/plugins/blocksBasicPlugin";
import { countdownPlugin } from "@/services/webpageEditor/plugins/countdownPlugin";
import { customCodePlugin } from "@/services/webpageEditor/plugins/customCodePlugin";
import { formsPlugin } from "@/services/webpageEditor/plugins/formsPlugin";
import grapesJSParserPostcss from "grapesjs-parser-postcss";
import grapesJSPluginExport from "grapesjs-plugin-export";
import grapesJSPresetWebpage from "grapesjs-preset-webpage";
import grapesJSStyleBg from "grapesjs-style-bg";
import grapesJSTabs from "grapesjs-tabs";
import grapesJSTooltip from "grapesjs-tooltip";
import grapesJSTouch from "grapesjs-touch";
import grapesJSTuiImageEditor from "grapesjs-tui-image-editor";
import grapesJSTyped from "grapesjs-typed";
import jsBeautify from "js-beautify";

const { css: cssFormat, html: htmlFormat } = jsBeautify;

export const WebpageEditorPlugins: EditorConfig["plugins"] = [
  usePlugin(blocksBasicPlugin, { flexGrid: true }),
  usePlugin(formsPlugin, { blocks: [] }),
  countdownPlugin,
  grapesJSPluginExport,
  usePlugin(grapesJSTabs, { tabsBlock: { category: "Extra" } }),
  customCodePlugin,
  grapesJSTouch,
  grapesJSParserPostcss,
  grapesJSTooltip,
  grapesJSTuiImageEditor,
  usePlugin(grapesJSTyped, {
    block: {
      category: "Extra",
      content: { strings: ["Text row one", "Text row two", "Text row three"], type: "typed", "type-speed": 40 },
    },
  }),
  grapesJSStyleBg,
  usePlugin(grapesJSPresetWebpage, {
    modalImportContent: (editorInstance: Editor) => {
      const html = editorInstance.getHtml();
      const css = editorInstance.getCss();
      return css ? `${htmlFormat(html)}<style>\n${cssFormat(css)}</style>` : htmlFormat(html);
    },
    modalImportLabel: "<div ui-heading mb-2.5>Paste here your HTML/CSS and click Import</div>",
    modalImportTitle: "Import Template",
  }),
];
