<script setup lang="ts">
import type { Editor } from "grapesjs";

import { authClient } from "@/services/auth/authClient";
import { EMAIL_EDITOR_LOCAL_STORAGE_KEY } from "@/services/emailEditor/constants";
import { useEmailEditorStore } from "@/store/emailEditor";
import grapesJS from "grapesjs";
import grapesJSMJML from "grapesjs-mjml";

defineRouteRules({ ssr: false });

const { data: session } = await authClient.useSession(useFetch);
const emailEditorStore = useEmailEditorStore();
const { readEmailEditor, saveEmailEditor } = emailEditorStore;
let editor: Editor | undefined;

const { trigger } = watchTriggerable(session, (newSession) => {
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
      type: newSession ? "remote" : "local",
    },
  });
  editor.Storage.add("remote", {
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
