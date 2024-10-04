<script setup lang="ts">
import type { Editor } from "grapesjs";

import { EMAIL_EDITOR_LOCAL_STORAGE_KEY } from "@/services/emailEditor/constants";
import { useEmailEditorStore } from "@/store/emailEditor";
import grapesJS from "grapesjs";
import grapesJSMJML from "grapesjs-mjml";

defineRouteRules({ ssr: false });

const { status } = useAuth();
const emailEditorStore = useEmailEditorStore();
const { readEmailEditor, saveEmailEditor } = emailEditorStore;
let editor: Editor | undefined;

const { trigger } = watchTriggerable(status, (newStatus) => {
  if (newStatus === "loading" || newStatus === "error") return;

  editor?.destroy();
  editor = grapesJS.init({
    container: ".v-main",
    fromElement: true,
    height: "100%",
    plugins: [grapesJSMJML],
    storageManager: {
      options: {
        local: {
          key: EMAIL_EDITOR_LOCAL_STORAGE_KEY,
        },
      },
      type: status.value === "authenticated" ? "remote" : "local",
    },
  });
  editor.Storage.add("remote", {
    load: () => readEmailEditor(),
    store: (data) => saveEmailEditor(data),
  });
  editor.setComponents(`
      <mjml>
        <mj-body>
        </mj-body>
      </mjml>`);
});

onMounted(() => {
  trigger();
});
</script>

<template>
  <NuxtLayout />
</template>

<style lang="scss">
@import "grapesjs/dist/css/grapes.min.css";
</style>
