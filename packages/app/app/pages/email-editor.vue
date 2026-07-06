<script setup lang="ts">
import type { Editor } from "grapesjs";

import { authClient } from "@/services/auth/authClient";
import { useEmailEditorStore } from "@/store/emailEditor";
import grapesJS from "grapesjs";
import grapesJSMJML from "grapesjs-mjml";

defineRouteRules({ ssr: false });

const { data: session } = await authClient.useSession(useFetch);
const emailEditorStore = useEmailEditorStore();
const { readEmailEditor, saveEmailEditor } = emailEditorStore;
let editor: Editor | undefined;
// The store branches between the authenticated document path and local storage,
// So a single storage adapter suffices; re-initialize on session change to reload from the right source
const { trigger } = watchTriggerable(session, () => {
  editor?.destroy();
  editor = grapesJS.init({
    container: ".v-main",
    fromElement: true,
    height: "100%",
    plugins: [grapesJSMJML],
    storageManager: {
      type: "document",
    },
  });
  editor.Storage.add("document", {
    load: () => readEmailEditor(),
    store: (data) => saveEmailEditor(data),
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
