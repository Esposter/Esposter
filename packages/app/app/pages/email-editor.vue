<script setup lang="ts">
import type { Editor } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { authClient } from "@/services/auth/authClient";
import { EMAIL_EDITOR_LOCAL_STORAGE_KEY } from "@/services/emailEditor/constants";
import { useEmailEditorStore } from "@/store/emailEditor";
import { jsonDateParse } from "@esposter/shared";
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
      type: newSession ? "remote" : "local",
    },
  });
  editor.Storage.add("local", {
    load: () => {
      const emailEditorJson = localStorage.getItem(EMAIL_EDITOR_LOCAL_STORAGE_KEY);
      return Promise.resolve(emailEditorJson ? new EmailEditor(jsonDateParse(emailEditorJson)) : new EmailEditor());
    },
    store: (data) =>
      new Promise<void>(() => {
        localStorage.setItem(EMAIL_EDITOR_LOCAL_STORAGE_KEY, JSON.stringify(data));
      }),
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
