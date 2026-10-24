<script setup lang="ts">
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { usePageBuilderStyle } from "@/composables/pageBuilder/usePageBuilderStyle";
import { usePageBuilderTheme } from "@/composables/pageBuilder/usePageBuilderTheme";
import { DEFAULT_THEME_COLOR, STYLE_COLOR_PROPERTIES, STYLE_SECTORS } from "@/services/pageBuilder/constants";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getStyleState, setStyleState } = pageBuilderCanvasStore;
const { getField, hasNode, resetField, setField } = usePageBuilderStyle(() => resourceId);
const { colors } = usePageBuilderTheme(() => resourceId);
// A colour field shows the value the property sets, else the one it inherits, else black, since a colour input holds a colour
const getColorValue = (property: StyleProperty) => {
  const { inheritedValue, value } = getField(property);
  return value || inheritedValue || DEFAULT_THEME_COLOR;
};
const styleState = computed({ get: () => getStyleState(resourceId), set: (value) => setStyleState(resourceId, value) });
const stateItems = [
  { title: "Default", value: StyleState.Default },
  { title: "Hover", value: StyleState.Hover },
];
// Every sector starts open, and a reader closes the ones they are not editing
const openSectors = ref(Object.fromEntries(STYLE_SECTORS.map(({ title }) => [title, true])));
</script>

<template>
  <div v-if="hasNode" flex flex-col gap-4>
    <UiToggleGroup v-model="styleState" :items="stateItems" label="Style state" />
    <UiCollapsible v-for="sector in STYLE_SECTORS" :key="sector.title" v-model="openSectors[sector.title]">
      <template #title>{{ sector.title }}</template>
      <div flex flex-col gap-3>
        <div v-for="property in sector.properties" :key="property" flex gap-2 items-end>
          <UiColorField
            v-if="STYLE_COLOR_PROPERTIES.includes(property)"
            :label="property"
            :model-value="getColorValue(property)"
            :swatches="colors"
            @update:model-value="(value) => setField(property, value)"
          />
          <PageBuilderStylePanelField
            v-else
            :label="property"
            :property
            :model-value="getField(property).value"
            :placeholder="getField(property).placeholder"
            @update:model-value="(value) => setField(property, value)"
          />
          <UiButton v-if="getField(property).value !== ''" @click="resetField(property)">Reset</UiButton>
        </div>
      </div>
    </UiCollapsible>
  </div>
  <p v-else text-muted>Select a block to style it</p>
</template>
