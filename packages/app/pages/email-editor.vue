<script setup lang="ts">
import { emailEditorTabItemCategoryDefinitions } from "@/services/emailEditor/emailEditorTabItemCategoryDefinitions";

defineRouteRules({ ssr: false });

await useReadEmailEditor();
const { background } = useColors();
const backgroundColor = computed(() => (isDark.value ? background.value : "white"));
const isDark = useIsDark();
const tab = ref(0);
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor }">
    <v-sheet h-full flex="!" flex-col>
      <v-tabs v-model="tab" :items="emailEditorTabItemCategoryDefinitions">
        <template #tab="{ item }">
          <EmailEditorTab :item="item" />
        </template>
        <template #item="{ item }">
          <EmailEditorTabItem :item="item" />
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
