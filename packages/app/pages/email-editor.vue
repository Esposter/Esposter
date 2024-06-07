<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import { EmailEditorTabType } from "@/models/emailEditor/EmailEditorTabType";
import type { Except } from "type-fest";

defineRouteRules({ ssr: false });

await useReadEmailEditor();
const { background } = useColors();
const backgroundColor = computed(() => (isDark.value ? background.value : "white"));
const isDark = useIsDark();
const tab = ref(0);
const baseTabs: Except<EmailEditorTabItemCategoryDefinition, "value">[] = [
  {
    type: EmailEditorTabType.Mjml,
    icon: "mdi-code-tags",
  },
  {
    type: EmailEditorTabType.Preview,
    icon: "mdi-email-search",
  },
];
const tabs = ref<EmailEditorTabItemCategoryDefinition[]>(baseTabs.map((t, index) => ({ ...t, value: index })));
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor }">
    <v-sheet h-full flex="!" flex-col>
      <v-tabs v-model="tab" :items="tabs">
        <template #tab="{ item }">
          <EmailEditorTab :item />
        </template>
        <template #item="{ item }">
          <EmailEditorTabItem :item />
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
