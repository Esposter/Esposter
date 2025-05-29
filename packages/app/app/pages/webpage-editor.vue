<script setup lang="ts">
import type { Editor } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { authClient } from "@/services/auth/authClient";
import { WEBPAGE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/webpageEditor/constants";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import grapesJS, { usePlugin } from "grapesjs";
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
import { css as cssFormat, html as htmlFormat } from "js-beautify";

defineRouteRules({ ssr: false });

const { data: session } = await authClient.useSession(useFetch);
const webpageEditorStore = useWebpageEditorStore();
const { readWebpageEditor, saveWebpageEditor } = webpageEditorStore;
let editor: Editor | undefined;

const { trigger } = watchTriggerable(session, (newSession) => {
  editor?.destroy();
  editor = grapesJS.init({
    container: ".v-main",
    fromElement: true,
    height: "100%",
    plugins: [
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
        modalImportContent: (editor: Editor) => {
          const html = editor.getHtml();
          const css = editor.getCss();
          return css ? `${htmlFormat(html)}<style>\n${cssFormat(css)}</style>` : htmlFormat(html);
        },
        modalImportLabel: '<div class="text-subtitle-2" mb-2.5>Paste here your HTML/CSS and click Import</div>',
        modalImportTitle: "Import Template",
      }),
    ],
    selectorManager: { componentFirst: true },
    showOffsets: true,
    storageManager: {
      type: newSession ? "remote" : "local",
    },
    styleManager: {
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
    },
  });
  editor.Storage.add("local", {
    load: () => {
      const webpageEditorJson = localStorage.getItem(WEBPAGE_EDITOR_LOCAL_STORAGE_KEY);
      return webpageEditorJson
        ? Object.assign(new WebpageEditor(), jsonDateParse(webpageEditorJson))
        : new WebpageEditor();
    },
    store: (data) => new Promise(() => localStorage.setItem(WEBPAGE_EDITOR_LOCAL_STORAGE_KEY, JSON.stringify(data))),
  });
  editor.Storage.add("remote", {
    load: () => readWebpageEditor(),
    store: (data) => saveWebpageEditor(data),
  });
});

onMounted(() => {
  trigger();
});
</script>

<template>
  <NuxtLayout />
</template>

<style lang="scss">
@use "grapesjs/dist/css/grapes.min.css";
</style>

<style scoped lang="scss">
:deep(.gjs-mdl-container) {
  z-index: 2000;
}
</style>
