<script setup lang="ts">
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { StyleState } from "#shared/models/pageBuilder/StyleState";
import {
  DEFAULT_THEME_COLOR,
  STYLE_CHOICES,
  STYLE_COLOR_PROPERTIES,
  STYLE_SECTORS,
} from "@/services/pageBuilder/constants";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getDevice, getSelectedNodeId, getStyleState, setStyleState } = pageBuilderCanvasStore;
// A text field keeps a draft it refused, which belongs to the node, breakpoint and state it was typed for, so every row
// Remounts when any of them changes, rather than showing that draft against the one now selected
const editTarget = computed(
  () => `${getSelectedNodeId(resourceId)}:${getDevice(resourceId)}:${getStyleState(resourceId)}`,
);
const { getField, hasNode, previewField, resetField, setField } = usePageBuilderStyle(() => resourceId);
// The opacity a drag is at while it moves, which the slider shows in place of the value the field holds
const opacityDrag = ref<number>();
const opacity = computed({
  get: () => opacityDrag.value ?? Number(getField("opacity").value || 1),
  set: (value) => {
    opacityDrag.value = value;
    previewField("opacity", String(value));
  },
});
// A drag that settles records its value once; a key's press settles at once, which the slider reports the same way
const settleOpacity = (value: number) => {
  opacityDrag.value = undefined;
  setField("opacity", String(value));
};
const { colors, fonts } = usePageBuilderTheme(() => resourceId);
// A font stack the theme holds is offered as a choice, which stores a reference to it, as a colour swatch does
const fontItems = computed(() => fonts.value.map(({ name }) => ({ title: name, value: `var(--${name})` })));
// A colour field shows the value the property sets, else the one it inherits, else black, since a colour input holds a colour
const getColorValue = (property: StyleProperty) => {
  const { inheritedValue, value } = getField(property);
  return value || inheritedValue || DEFAULT_THEME_COLOR;
};
// Each choice of a property is a segment of its toggle group, titled as the value it sets
const getChoiceItems = (property: StyleProperty) =>
  (STYLE_CHOICES[property] ?? []).map((choice) => ({ title: choice, value: choice }));
const styleState = computed({ get: () => getStyleState(resourceId), set: (value) => setStyleState(resourceId, value) });
const stateItems = [
  { title: "Default", value: StyleState.Default },
  { title: "Hover", value: StyleState.Hover },
];
// Every sector starts open, and a reader closes the ones they are not editing
const closedSectors = ref(new Set<string>());
const setSectorOpen = (title: string, isOpen: boolean) => {
  if (isOpen) closedSectors.value.delete(title);
  else closedSectors.value.add(title);
};
</script>

<template>
  <div v-if="hasNode" flex flex-col gap-4>
    <UiToggleGroup v-model="styleState" :items="stateItems" label="Style state" />
    <UiCollapsible
      v-for="sector in STYLE_SECTORS"
      :key="sector.title"
      :model-value="!closedSectors.has(sector.title)"
      @update:model-value="(isOpen) => setSectorOpen(sector.title, isOpen)"
    >
      <template #title>{{ sector.title }}</template>
      <div flex flex-col gap-3>
        <div v-for="property in sector.properties" :key="`${editTarget}/${property}`" flex gap-2 items-end>
          <UiColorField
            v-if="STYLE_COLOR_PROPERTIES.includes(property)"
            :label="property"
            :model-value="getColorValue(property)"
            :swatches="colors"
            @update:model-value="(value) => setField(property, value)"
          />
          <UiToggleGroup
            v-else-if="property in STYLE_CHOICES"
            :items="getChoiceItems(property)"
            :label="property"
            :model-value="getField(property).value"
            @update:model-value="(value) => setField(property, value)"
          />
          <UiSlider
            v-else-if="property === 'opacity'"
            v-model="opacity"
            :label="property"
            :max="1"
            :min="0"
            :step="0.01"
            :value-text="`${Math.round(opacity * 100)}%`"
            @end="(value) => settleOpacity(value)"
          />
          <PageBuilderStylePanelBackgroundLayers
            v-else-if="property === 'background-image'"
            :model-value="getField(property).value"
            :placeholder="getField(property).placeholder"
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
          <UiSelect
            v-if="property === 'font-family' && fontItems.length > 0"
            :items="fontItems"
            label="font stack"
            :model-value="getField(property).value"
            @update:model-value="(value) => setField(property, value)"
          />
          <UiButton v-if="getField(property).value !== ''" @click="resetField(property)">Reset</UiButton>
        </div>
      </div>
    </UiCollapsible>
  </div>
  <p v-else text-muted>Select a block to style it</p>
</template>
