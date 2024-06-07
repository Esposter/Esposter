<script setup lang="ts">
import { extendedLanguages } from "@/models/esbabbler/file/LanguageRegexSupportPatternMap";
import type { TabItemCategoryDefinition } from "@/models/vuetify/TabItemCategoryDefinition";
import { useEmailEditorStore } from "@/store/emailEditor";
import type { Extension } from "@codemirror/state";
import { Compartment } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import type { Except } from "type-fest";
import { Codemirror } from "vue-codemirror";

await useReadEmailEditor();
const emailEditorStore = useEmailEditorStore();
const { emailEditor } = storeToRefs(emailEditorStore);
const { background } = useColors();
const isDark = useIsDark();
const backgroundColor = computed(() => (isDark.value ? background.value : "white"));
const tab = ref(0);
const baseTabs: Except<TabItemCategoryDefinition, "value">[] = [
  {
    icon: "mdi-code-tags",
    text: "mjml",
  },
];
const tabs = ref<TabItemCategoryDefinition[]>(baseTabs.map((t, index) => ({ ...t, value: index })));
const editorView = shallowRef<EditorView>();
const extensions: Extension[] = [];
const languageRequested = extendedLanguages.find((l) => l.name === "HTML");
if (languageRequested) {
  const languageSupport = await languageRequested.load();
  const languageConfiguration = new Compartment();
  extensions.push(languageConfiguration.of(languageSupport));
}
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor }">
    <v-sheet h-full flex="!" flex-col>
      <v-tabs v-model="tab" :items="tabs">
        <template #tab="{ item }">
          <StyledTab :item />
        </template>
        <template #item="{ item }">
          <StyledTabsWindowItem h-full :item>
            <Codemirror v-model="emailEditor.mjml" :extensions @ready="({ view }) => (editorView = view)" />
          </StyledTabsWindowItem>
        </template>
      </v-tabs>
    </v-sheet>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.v-window {
  flex-grow: 1;
}

:deep(.v-window__container),
:deep(.cm-editor) {
  height: 100%;
}
</style>
