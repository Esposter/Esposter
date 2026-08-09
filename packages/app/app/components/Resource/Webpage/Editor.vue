<script setup lang="ts">
import { GRAPES_JS_EDITOR_CONTAINER_ID } from "@/services/grapesjs/constants";
import { createWebpageSurveyInviteBlocks } from "@/services/webpageEditor/createWebpageSurveyInviteBlocks";
import { WebpageEditorPlugins } from "@/services/webpageEditor/WebpageEditorPlugins";
import { WebpageEditorStyleManager } from "@/services/webpageEditor/WebpageEditorStyleManager";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { ResourceType } from "@esposter/db-schema";
import "grapesjs/dist/css/grapes.min.css";

const webpageEditorStore = useWebpageEditorStore();
const { readWebpageEditor, saveWebpageEditor } = webpageEditorStore;
const uploadFile = useUploadResourceFile(ResourceType.Webpage, () => webpageEditorStore.resource?.id ?? "");
const { publishedSurveys } = useReadPublishedSurveys();
const { editor } = await useGrapesJsEditor(
  {
    load: () => readWebpageEditor(),
    store: (data, storeEditor) => saveWebpageEditor(data, { css: storeEditor.getCss(), html: storeEditor.getHtml() }),
  },
  {
    plugins: WebpageEditorPlugins,
    selectorManager: { componentFirst: true },
    showOffsets: true,
    styleManager: WebpageEditorStyleManager,
  },
  { upload: uploadFile },
);

useSurveyInviteBlocks(editor, publishedSurveys, createWebpageSurveyInviteBlocks);
</script>

<template>
  <div :id="GRAPES_JS_EDITOR_CONTAINER_ID" h-full overflow-hidden />
</template>

<style scoped lang="scss">
:deep(.gjs-mdl-container) {
  z-index: 2000;
}
</style>
